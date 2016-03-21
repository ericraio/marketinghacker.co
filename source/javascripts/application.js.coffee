#= require jquery/dist/jquery
#= require slimscroll/jquery.slimscroll
#= require fullpage.js/dist/jquery.fullpage
#= require vendor/casper

$(document).ready () =>
  $('#fullpage').fullpage({
    scrollOverflow: true
    afterLoad: (anchorLink, index) =>
        $(this).slimScroll({ scrollTo: '0px' })
  })
