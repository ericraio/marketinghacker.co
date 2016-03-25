//= require jquery/dist/jquery
//= require slimscroll/jquery.slimscroll
//= require fullpage.js/dist/jquery.fullpage
//= require selection-sharer/dist/selection-sharer
//= require vendor/casper
//= require lunr.js/lunr
//= require handlebars/handlebars
//= require js-cookie/src/js.cookie


jQuery(function($) {
  if(Cookies.get('welcomeMat') !== 'true') {
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
  }

  $('.scroll-down a').click(function(e) {
    e.preventDefault();
    $.fn.fullpage.moveSectionDown();
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
    ajaxSuccess: function() {
      Cookies.set('welcomeMat', true, { expires: 30 });
      $.fn.fullpage.moveSectionDown();
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
    ajaxSubmit: function() {
      var form = $('.email-octopus-form');
      $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize(),
        success: function() {
          var arr = form.serializeArray();
          var field = arr.find(function(f) { return f.name === 'emailAddress'; });
          if (field) { Cookies.set('email', field.value); }
          emailOctopus.ajaxSuccess();
        },
        error: function(textStatus) {
          emailOctopus.ajaxError(textStatus);
        },
      });
    }
  };

  $('.email-octopus-form').submit(function(e) {
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
      emailOctopus.ajaxSubmit();
    }

    return false;
  });

});
