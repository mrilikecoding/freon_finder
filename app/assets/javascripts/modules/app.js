// Backbone app
var freonFinder = {
    model:{},
    view:{},
    collection:{},
    router:{}
};

//model
freonFinder.model.Postings = Backbone.Model.extend({
    default:{
        category: "",
        timestamp: null,
        id: null,
        source: "CRAIG",
        location: {},
        external_id: "",
        heading: "",
        external_url: "",
        body: ""
    }
});


//collection
freonFinder.collection.Postings = Backbone.Collection.extend({

    search : function(letters){

        if (letters === ''){
            return this;
        }

        var pattern = new RegExp(letters,'gi');
        return _(this.filter(function(data) {
            return pattern.test(data.get('heading'));
        }));
    },

    rejectWord : function(letters){
        var pattern = new RegExp(letters,'gi');
        return _(this.reject(function(data) {
            return pattern.test(data.get('heading'));
        }));

    },

    byState: function(state){
        if (state.toLowerCase() !== 'filter by state') {
            var filtered =  _(this.filter(function(posting){
                if (typeof(posting.get('location').state) !== undefined){
                    return posting.get('location').state === state;
                }
            }));
            return filtered;

        } else {
            return this;
        }
    },

    url: '/list?search=' + window.SEARCH_TERM

});


freonFinder.collection.postings = new freonFinder.collection.Postings();

//views
freonFinder.view.filterStateItem = Backbone.View.extend({
    tagName: 'option',
    render: function(data){
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    initialize: function(){
        this.template = _.template('<%= location.state %>');
    }
});

freonFinder.view.filterStateContainer = Backbone.View.extend({

    render: function(data) {
        $(this.el).html(this.template);
        return this;
    },
    renderStates: function(postings){
        $('#filterByState').html('').append('<option value="">All States</option>');
        
        var states  = _.uniq(_.pluck(postings.pluck('location'), 'state')).sort();

        _.each(states, function(state){
            $('#filterByState').append('<option>' + state + '</option>');
        });

        return this;
    },
    initialize: function(){
        this.collection.bind('reset', this.render, this);
    }
});

freonFinder.view.PostingsItem = Backbone.View.extend({
    tagName: 'tr',
    render: function(data) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    initialize : function(){
        this.template = _.template(tpl.get('posting_item'));
    }
});

freonFinder.view.PostingsContainer = Backbone.View.extend({
    render: function(data) {
        $(this.el).html(this.template);
        return this;
    },
    renderList : function(postings){
        $('tbody').html('');
        $('.result-count').text('is displaying ' + (postings.length ? postings.length : postings._wrapped.length) + ' results' );

        postings.each(function(posting){

            var view = new freonFinder.view.PostingsItem({
                model: posting,
                collection: this.collection
            });

            $('tbody').append(view.render().el);
        });


        return this;
    },
    initialize : function(){
        this.template = _.template(tpl.get('posting_container'));
        this.collection.bind('reset', this.render, this);
    }

});


freonFinder.view.MapsContainer = Backbone.View.extend({

    search: function(){
        var letters = $('#searchTask').val(),
            postings = freonFinder.collection.postings.search(letters);

        freonFinder.view.MapsContainer.drawMap(postings);
    },

    tagName: 'div class="map-container"',

    initialize: function(){
        this.template = _.template(tpl.get('map'));
        this.collection.bind('reset', this.render, this);
    },

    render: function(){
        $(this.el).html(this.template);
        return this;
    },

    drawMap: function(postings) {
        var self = this;

        var mapOptions = {
            center: new google.maps.LatLng(41.397, -87.644),
            zoom: 4
        };

        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        var infowindow;

        postings.each(function(posting){
            var p = posting.attributes;
            var lat = p.location.lat;
            var long = p.location.long;
            var heading = p.heading;
            var location = p.location.state + ", " + p.location.zipcode;
            var post_url = p.external_url;
            var formatted_address = p.location.formatted_address;

            var Latlng = new google.maps.LatLng(lat,long);
            var marker = new google.maps.Marker({
                position: Latlng,
                title:"Hello World!",
                //animation: google.maps.Animation.DROP
            });

            // To add the marker to the map, call setMap();
            marker.setMap(map);

            var contentString = '<div id="content">'+
                '<div id="siteNotice">'+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">' + heading + '</h1>'+
                '<div id="bodyContent">'+
                '<p>Location: ' + location + '</p>' +
                '<p>Formatted Address: ' + formatted_address + '</p>' +
                '<p>Source: <a target="_blank" href="'+ post_url + '">'+
                post_url + '</a> '+
                '</p></div></div>';


            google.maps.event.addListener(marker, 'click', function() {

                if (infowindow){
                    infowindow.close();
                }

                infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                infowindow.open(map,marker);
            });
        });
    }
});


// router
freonFinder.router.Postings = Backbone.Router.extend({

    initialize: function(){
        freonFinder.collection.postings.fetch({
            error: function(){
                alert('error!');
            },
            success: function(){
                var self = this;
                var $checkboxes = $('input', '.filters');

                this.postContainerView = new freonFinder.view.PostingsContainer({
                    collection: freonFinder.collection.postings
                });

                this.filterStateContainerView = new freonFinder.view.filterStateContainer({
                    collection: freonFinder.collection.postings
                });

                this.mapContainerView = new freonFinder.view.MapsContainer({
                    collection: freonFinder.collection.postings
                });

                $('.spinner').hide();
                $('.freon-finder').append(this.mapContainerView.render().el);
                $('.freon-finder').append(this.postContainerView.render().el);
                $('#filterByState').append(this.filterStateContainerView.render().el);

                this.mapContainerView.drawMap(this.mapContainerView.collection);
                this.postContainerView.renderList(freonFinder.collection.postings);
                this.filterStateContainerView.renderStates(freonFinder.collection.postings);

                $(document)
                    .on('click', '.refresh-map', function(){
                        var letters = $("#searchTask").val(),
                            postings = freonFinder.collection.postings.search(letters);
                        self.mapContainerView.drawMap(postings);
                    })
                    .on('change', '.filter', function(){
                        var word = $(this).data('reject-word'),
                            postings = freonFinder.collection.postings;
                        if( $(this).is(':checked')){
                            self.postContainerView.renderList(postings.rejectWord(word));
                        } else {
                            self.postContainerView.renderList(postings.search(''));
                        }
                    })
                    .on('keyup', '#searchTask', function(){
                        console.log('change');
                        var letters = $("#searchTask").val(),
                            postings = freonFinder.collection.postings.search(letters);
                        self.postContainerView.renderList(postings);
                        _.debounce(self.mapContainerView.drawMap(postings), 1000, true);
                    })
                    .on('change', '#filterByState', function(){
                        var state = $('#filterByState').val(),
                            postings = freonFinder.collection.postings.byState(state);
                        if (state !== ''){
                            self.postContainerView.renderList(postings);
                            self.mapContainerView.drawMap(postings);
                        } else {
                            self.postContainerView.renderList(freonFinder.collection.postings);
                            self.mapContainerView.drawMap(freonFinder.collection.postings);
                        }
                    });
            }
        });
    }
});



var tpl = {

    // Hash of preloaded templates for the app
    templates:{},

    // Recursively pre-load all the templates for the landingApp.
    // This implementation should be changed in a production environment. All the template files should be
    // concatenated in a single file.

    loadTemplates:function (names, callback) {

        var that = this;

        var loadTemplate = function (index) {
            var name = names[index];
            $.get('/templates/' + name + '.html.ejs', function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        };

        loadTemplate(0);
    },

    // Get template by name from hash of preloaded templates
    get:function (name) {
        return this.templates[name];
    }
};


// load templates and kickoff backbone app freon_finder.js
tpl.loadTemplates(['postings', 'map', 'posting_container', 'posting_item'], function () {
    freonFinder.router.postings = new freonFinder.router.Postings;
    Backbone.history.start();
});
