//= require jquery/dist/jquery
//= require slimscroll/jquery.slimscroll
//= require fullpage.js/dist/jquery.fullpage
//= require selection-sharer/dist/selection-sharer
//= require vendor/casper
//= require lunr.js/lunr
//= require handlebars/handlebars


jQuery(function($) {
  $('#fullpage').fullpage({
    scrollOverflow: true,
    paddingTop: '0px',
    onLeave: function(index, nextIndex, direction) {
      if (nextIndex === 1) {
        return false;
      }
    }
  });

  $('.post-content').selectionSharer();

  function populateIndex(data) {
    var index = lunr(function(){
      this.field('title', { boost: 10 });
      this.field('content');
      this.ref('id');
    });
    data.forEach(function(item) {
      index.add(item);
    });
    return index;
  }

  function contentList(data) {
    var contents = [];
    data.forEach(function(item) {
      contents.push(item);
    });
    return contents;
  }

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  function searchSetup(index, contents){
    // Set up Handlebars template
    var resultsTemplate = Handlebars.compile($("#results-template").html());

    // various event handlers...

    $("#search-field").bind("keyup", debounce(function(){
      $(".search-results").empty();
      if ($(this).val() < 2) return;
      var query = $(this).val();
      var results = index.search(query).slice(0,4);
      $.each(results, function(index, result){
        $(".search-results").append(resultsTemplate({
          title: contents[result.ref].title,
          url: contents[result.ref].url
        }));
      });
    }, 50, true));
  }

  $.getJSON("/search.json", function(data) {
    var index = populateIndex(data);
    var contents = contentList(data);
    searchSetup(index, contents);
    // other code for app below - anything that needs search functionality
    // lives inside of this callback
    // ...
  });


});
