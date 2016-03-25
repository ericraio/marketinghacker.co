//= require jquery/dist/jquery
//= require slimscroll/jquery.slimscroll
//= require fullpage.js/dist/jquery.fullpage
//= require selection-sharer/dist/selection-sharer
//= require vendor/casper
//= require lunr.js/lunr
//= require handlebars/handlebars
//= require js-cookie/src/js.cookie

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

window.MH = {

  fullPageScrollDown: function() {
    $('.scroll-down a').click(function(e) {
      e.preventDefault();
      $.fn.fullpage.moveSectionDown();
    });
  },

  getSearchResults: function() {
    $.getJSON("/search.json", function(data) {
      var index = populateIndex(data);
      var contents = contentList(data);
      searchSetup(index, contents);
      // other code for app below - anything that needs search functionality
      // lives inside of this callback
      // ...
    });
  },

  welcomeMatFormSetup: function() {
    $('.welcome-mat-form').submit(function(e) {
      e.preventDefault();
      var form = $(this);
      var errorMessage = form.find('.email-octopus-error-message');
      var email = form.find('.email-octopus-email-address').val();
      errorMessage.empty();

      if (emailOctopus.isBotPost()) {
        errorMessage.text(
          emailOctopus.botSubmissionErrorMessage
        );
      } else if (!$.trim(email)) {
        errorMessage.text(
          emailOctopus.missingEmailAddressMessage
        );
      } else if (!emailOctopus.basicValidateEmail(email)) {
        errorMessage.text(
          emailOctopus.invalidParametersErrorMessage
        );
      } else {
        emailOctopus.welcomeMatSubmit(form);
      }

      return false;
    });
  },

  scrollPopupFormSetup: function() {
    $('.scroll-popup-form').submit(function(e) {
      e.preventDefault();
      var form = $(this);
      var errorMessage = form.find('.email-octopus-error-message');
      var email = form.find('.email-octopus-email-address').val();
      errorMessage.empty();

      if (emailOctopus.isBotPost()) {
        errorMessage.text(
          emailOctopus.botSubmissionErrorMessage
        );
      } else if (!$.trim(email)) {
        errorMessage.text(
          emailOctopus.missingEmailAddressMessage
        );
      } else if (!emailOctopus.basicValidateEmail(email)) {
        errorMessage.text(
          emailOctopus.invalidParametersErrorMessage
        );
      } else {
        emailOctopus.scrollPopupSubmit(form);
      }

      return false;
    });
  },

  initFacebookComments: function() {
    var facebookComments = $('#facebook-comments');
    if (facebookComments.length) {
      var url = window.location.href;
      var htmlString = '<div class="fb-comments" data-href="' + url + '" data-numposts="5" data-width="100%"></div>';
      facebookComments.html(htmlString);
    }
  },

  init: function() {
    if(!Cookies.get('email')) {
      $('.welcome-mat').css({ display: 'table' });
      $('#fullpage').fullpage({
        scrollOverflow: true,
        paddingTop: '0px',
        sectionsColor: ['#F6F8F8', '#FFF'],
        onLeave: function(index, nextIndex, direction) {
          if (nextIndex === 1) {
            return false;
          }
        }
      });

      if (!Cookies.get('popupClosed')) {
        $(window).scroll(function(){
          if(!window.popupClosed && $(document).scrollTop()>=$(document).height()/5) {
            $("#spopup").show("slow");
          } else {
            $("#spopup").hide("slow");
          }
        });
      }

      $('#spopup-close').click(function() {
        window.popupClosed = true;
        Cookies.set('popupClosed', true, { expires: 1 });
        $('#spopup').hide('slow');
      });
    }

    this.fullPageScrollDown();
    this.getSearchResults();
    this.welcomeMatFormSetup();
    this.scrollPopupFormSetup();
    this.initFacebookComments();

    $('.post-content').selectionSharer();
  }

};

var emailOctopus = {
  missingEmailAddressMessage: 'Your email address is required.',
  invalidEmailAddressMessage: 'Your email address looks incorrect, please try again.',
  botSubmissionErrorMessage: 'This doesn\'t look like a human submission.',
  unknownErrorMessage: 'Sorry, an unknown error has occurred. Please try again later.',
  isBotPost: function() {
    return $('.email-octopus-form-row-hp input').val();
  },
  basicValidateEmail: function(email) {
    var regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  },
  emailSuccess: function(form) {
    var arr = form.serializeArray();
    var field = arr.find(function(f) { return f.name === 'emailAddress'; });
    if (field) { Cookies.set('email', field.value); }
  },
  welcomeMatSuccess: function() {
    if (window._gaq) {
      window._gaq.push(['_trackEvent', 'Newsletter', 'Signup', 'Welcome Mat', 1]);
    }
    $.fn.fullpage.moveSectionDown();
  },
  scrollPopupSuccess: function() {
    if (window._gaq) {
      window._gaq.push(['_trackEvent', 'Newsletter', 'Signup', 'Scroll Popup', 1]);
    }
    window.popupClosed = true;
    $('#spopup').hide('slow');
  },
  ajaxError: function(textStatus) {
    var response = $.parseJSON(textStatus.responseText);
    if (response && response.error && response.error.code) {
      switch(response.error.code) {
        case 'INVALID_PARAMETERS':
          $('.email-octopus-error-message').text(
            emailOctopus.invalidParametersErrorMessage
        );
        return;
        case 'BOT_SUBMISSION':
          $('.email-octopus-error-message').text(
            emailOctopus.botSubmissionErrorMessage
        );
        return;
      }
    }

    $('.email-octopus-error-message').text(
      emailOctopus.unknownErrorMessage
    );
  },
  welcomeMatSubmit: function(form) {
    $.ajax({
      type: form.attr('method'),
      url: form.attr('action'),
      data: form.serialize(),
      success: function() {
        emailOctopus.emailSuccess(form);
        emailOctopus.welcomeMatSuccess();
      },
      error: function(textStatus) {
        emailOctopus.ajaxError(textStatus);
      },
    });
  },
  scrollPopupSubmit: function(form) {
    $.ajax({
      type: form.attr('method'),
      url: form.attr('action'),
      data: form.serialize(),
      success: function() {
        emailOctopus.emailSuccess(form);
        emailOctopus.scrollPopupSuccess();
      },
      error: function(textStatus) {
        emailOctopus.ajaxError(textStatus);
      },
    });
  }
};

jQuery(function($) {
  window.MH.init();
});
