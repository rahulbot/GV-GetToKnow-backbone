var splashView; // HACK: needs to be global so template can access country data

(function($){

var SplashView = Backbone.View.extend({

    events: {
      "change #gv-country":    "lookupCountry",
    },
    
    initialize: function(){
        this.loadCountryData();
        this.render();
    },
     
    // render the whole app
    render: function(){
        $(this.el).load("templates/app.template");
    },
    
    // load up the list of GV countries and urls
    loadCountryData: function(){
        var that = this;
        jQuery.getJSON("data/countries.json", function(data){
            that.countryToPath = data;
        });
    },
    
    // if the country is a valid one, update the map and content
    lookupCountry: function(){
        var currentCountry = $('#gv-country').val();
        if (_.has(this.countryToPath,currentCountry) ){
            rssUrl = "http://globalvoicesonline.org"+this.countryToPath[currentCountry]+"feed";
            $('#gv-country').attr('disabled', 'disabled');
            $('.gv-story').hide();
            $('#gv-loading').show();
            this.updateGlobalVoicesContent(rssUrl);
            this.updateBackgroundMap(currentCountry);
        }
    },

    // fetch the latest content from the country's RSS feed
    updateGlobalVoicesContent: function(rssUrl){
        var that = this;
        $.ajax({
            url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(rssUrl),
            dataType: 'json',
            success: function(data) {
                stories = _.first(data.responseData.feed.entries,3);
                $('#gv-country').attr('disabled', false);
                that.updateOneStory(stories[0], '#gv-story-1');
                that.updateOneStory(stories[1], '#gv-story-2');
                that.updateOneStory(stories[2], '#gv-story-3');
                $('#gv-loading').hide();
                $('.gv-story').show();
            }
        });
    },

    // update the teaser for one story
    updateOneStory:function(story, dest){
        $(dest).empty();
        $.ajax({url:"templates/story.template", 
              type: "GET",
              dataType: "text",
              success: function(content){
                $(dest).html(_.template(content, {
                    link: story.link,
                    title: story.title, 
                    author: story.author, 
                    contentSnippet: story.contentSnippet
                    }));
            }});
    },

    // update the background map (centered on the country)
    updateBackgroundMap:function(country){
         $.ajax({
            url: 'http://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(country)+'&sensor=false',
            dataType: 'json',
            success: function(data) {
                var loc = data.results[0].geometry.location;
                var mapUrl = "http://maps.stamen.com/watercolor/embed#3/"+loc.lat+"/"+loc.lng;
                $('#gv-map').attr('src',mapUrl);
            }
          });
    }
    

});

splashView = new SplashView;

// kick off the app!
$("#app").html(splashView.el);

})(jQuery);
