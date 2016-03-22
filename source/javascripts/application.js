//= require jquery/dist/jquery
//= require slimscroll/jquery.slimscroll
//= require fullpage.js/dist/jquery.fullpage
//= require selection-sharer/dist/selection-sharer
//= require vendor/casper
//= require lunr.min


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
});
