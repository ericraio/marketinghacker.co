#= require jquery/dist/jquery
#= require slimscroll/jquery.slimscroll
#= require fullpage.js/dist/jquery.fullpage
#= require selection-sharer/dist/selection-sharer
#= require vendor/casper

$(document).ready () =>
  $('#fullpage').fullpage({
    scrollOverflow: true
    paddingTop: '0px',
    afterLoad: (anchorLink, index) =>
        $(this).slimScroll({ scrollTo: '0px' })
  })

  $('.post-content').selectionSharer()
