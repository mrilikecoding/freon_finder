// Backbone app
var freonFinder = {
    model:{},
    view:{},
    collection:{},
    router:{}
}

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

        if (letters == ""){
            return this;
        }

        var pattern = new RegExp(letters,"gi");
        return _(this.filter(function(data) {
            console.log('getting ' + letters);
            return pattern.test(data.get("heading"));
        }));
    },

    url: "/list"


});


freonFinder.collection.postings = new freonFinder.collection.Postings();
freonFinder.collection.postings.fetch()



//views
freonFinder.view.PostingsItem = Backbone.View.extend({
    tagName: 'tr',
    events: {},
    render: function(data) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },
    initialize : function(){
        this.template = _.template(tpl.get('posting_item'));
    }
});

freonFinder.view.PostingsContainer = Backbone.View.extend({
    tagName: 'div',
    events: {
        "keyup #searchTask" : "search",
        "rendered" : "search"
    },
    render: function(data) {
        $(this.el).html(this.template).trigger('rendered');

        return this;
    },
    renderList : function(postings){
        postings.each(function(posting){

            var view = new freonFinder.view.PostingsItem({
                model: posting,
                collection: this.collection
            });

            $("tbody").append(view.render().el);
        });
        return this;
    },
    initialize : function(){
        this.template = _.template(tpl.get('posting_container'));
        this.collection.bind("reset", this.render, this);
        //this.on('rendered', this.search, this);
    },
    search: function(e){
        var letters = $("#searchTask").val() ? $("#searchTask").val() : "freon";
        this.renderList(this.collection.search(letters));
    }
});


freonFinder.view.MapsContainer = Backbone.View.extend({
    tagName: 'div class="map-container"',

//    events: {
//        "keyup #searchTask" : "search"
//    },

    initialize: function(){
        this.template = _.template(tpl.get('map'));
        this.collection.bind("reset", this.render, this);

    },

    render: function(){
        $(this.el).html(this.template);
        return this;
    },
//    search: function(e){
//        var letters = $("#searchTask").val();
//        this.drawMap(this.collection);
//    },

    drawMap: function(postings) {
        var self = this;
        var mapOptions = {
            center: new google.maps.LatLng(41.397, -87.644),
            zoom: 5
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
                animation: google.maps.Animation.DROP
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
                '<p>Source: <a href="'+ post_url + '">'+
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

        this.postContainerView = new freonFinder.view.PostingsContainer({
            collection: freonFinder.collection.postings

        });

        this.mapContainerView = new freonFinder.view.MapsContainer({
            collection:freonFinder.collection.postings
        });

        $('.spinner').hide();
        $(".freon-finder").append(this.mapContainerView.render().el);
        $(".freon-finder").append(this.postContainerView.render().el);
        this.mapContainerView.drawMap(this.mapContainerView.collection);
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
        }

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