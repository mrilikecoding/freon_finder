// Backbone Application ________________________________________________________________ */

var app = app || {}


// MODELS

window.Posting = Backbone.Model.extend({
    defaults:{
        category: "",
        timestamp: null,
        id: null,
        source: "CRAIG",
        location: {},
        external_id: "",
        heading: "",
        external_url: ""
    }
});

// COLLECTIONS

window.Postings = Backbone.Collection.extend({
    model: Posting,
    url:"/list"

});

// VIEWS

window.PostingsView = Backbone.View.extend({
    initialize: function(){
        this.template = _.template(tpl.get('postings'));
    },
    render: function(){
        var self = this;
        $('.spinner').hide();
        _.each(self.model.models, function (posting) {
            $('.freon-finder tbody').append(self.template(posting.toJSON()));
        });
        return this;
    }
});

window.MapView = Backbone.View.extend({

   initialize: function(){
        this.template = _.template(tpl.get('map'));
    },
   render: function(){
        var self = this;
        $('.freon-finder .map-container').html(self.template(this.model.toJSON()));
       return this;
   },
   events: {
        'click li.map': function(){
        }
   },

   drawMap: function() {
       var self = this;
       var mapOptions = {
           center: new google.maps.LatLng(41.397, -87.644),
           zoom: 5
       };

       var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

       _.each(self.model.models, function (posting) {
           var lat = posting.attributes.location.lat;
           var long = posting.attributes.location.long;
//           var Latlng = new google.maps.LatLng(-25.363882,131.044922);
           var Latlng = new google.maps.LatLng(lat,long);

           var marker = new google.maps.Marker({
               position: Latlng,
               title:"Hello World!"
           });


           // To add the marker to the map, call setMap();
           marker.setMap(map);
       });


   }
});

// ROUTER

var AppRouter = Backbone.Router.extend({

    initialize:function () {
        if (this.postings) {
            this.renderPostings(this);
        } else {
            this.bootstrapPostings(this);
        }
    },

    renderPostings: function (self) {
        app.postingsView = new PostingsView({model:self.postings});
        app.postingsView.render();
        app.postingsView.trigger('rendered');
    },

    renderMap: function (self) {
        app.mapView = new MapView({model:self.postings});
        app.mapView.render();
        app.mapView.drawMap(self);
        app.mapView.trigger('mapViewRendered');

    },

    bootstrapPostings: function(self){
        self.postings = new Postings();
        self.postings.fetch({
            success: function(){
                self.renderMap(self);
                self.renderPostings(self);
            }
        });
    }
});



//UTILS
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
tpl.loadTemplates(['postings', 'map'], function () {
    app = new AppRouter();
    Backbone.history.start();
});
