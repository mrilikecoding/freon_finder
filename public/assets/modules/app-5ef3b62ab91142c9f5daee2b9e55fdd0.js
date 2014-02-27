// Backbone Application ________________________________________________________________ */

var app = app || {}

// 3taps config @todo move to private
var auth_token = "6480f6c096df27e96b7da685d3f1c1ee";
//number of results per page
var rpp = "5";
var heading = "freon";

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
        console.log(self.model.toJSON());
        _.each(self.model.models, function (posting) {
            $('.freon-finder').append(self.template(posting.toJSON()));
        });
        return this;
    }
});

window.MapView = Backbone.View.extend({
   initialize: function(){
        this.template = _.template(tpl.get('map'));
    },
    render: function(){
        $('.freon-finder tbody').html(this.template(this.model.toJSON()));
        return this;
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

    renderMap   : function (self) {
        app.mapView = new MapView();
        app.mapView.render();
        app.mapView.trigger('rendered');
    },

    bootstrapPostings: function(self){
        self.postings = new Postings();
        self.postings.fetch({
            success: function(){
                self.renderPostings(self);
                console.log(self);
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
