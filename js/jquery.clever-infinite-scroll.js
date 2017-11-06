/**
 * jquery.clever-infinite-scroll.js
 * Working with jQuery 2.1.4
 *
 * Twitter: @watarutwt
 * GitHub: @wataruoguchi
 */
/* global define, require, history, window, document, location  */
(function(root, factory) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    factory(require("jquery"));
  } else {
    factory(root.jQuery);
  }
})(this, function($) {
  "use strict";
  /**
   * Elements it reffers. Each page must has those selectors.
   * The structure must be same as article1.html
   * #contentsWrapper, .content, #next
   */
  $.fn.cleverInfiniteScroll = function(options) {
    /**
     * Settings
     */
    var windowHeight = (typeof window.outerHeight !== "undefined") ? Math.max(window.outerHeight, $(window).height()) : $(window).height(),
      defaults = {
        contentsWrapperSelector: "#contentsWrapper",
        contentSelector: ".content",
        nextSelector: "#next",
        loadImage: "",
        offset: windowHeight,
      },
      settings = $.extend(defaults, options);

    /**
     * Private methods
     */
    var generateHiddenSpans = function(_title, _path) {
        return "<span class='hidden-title' style='display:none'>" + _title + "</span><span class='hidden-url' style='display:none'>" + _path + "</span>";
      },
      setTitleAndHistory = function(_title, _path) {
        // Set history
        history.replaceState(null, _title, _path);
        // Set title
        $("title").html(_title);
      },
      changeTitleAndURL = function(_value) {
        // value is an element of a content user is seeing
        // Get title and path of the article page from hidden span elements
        var title = $(_value).children(".hidden-title:first").text(),
          path = $(_value).children(".hidden-url:first").text();
        if ($("title").text() !== title) {
          // If it has changed
          $(settings.contentSelector).removeClass("active");
          $(_value).addClass("active");
          setTitleAndHistory(title, path);
          $(document).trigger('clever-infinite-scroll-url-change', [title, path]);
        }
      };

    /**
     * Initialize
     */
    // Get current page's title and URL.
    var title = $("title").text(),
      path = $(location).attr("href"),
      documentHeight = $(document).height(),
      threshold = settings.offset,
      $contents = $(settings.contentSelector);
    // Set hidden span elements and history
    $(settings.contentSelector + ":last").append(generateHiddenSpans(title, path));
    $(settings.contentSelector).addClass("active");
    setTitleAndHistory(title, path);

    /**
     * scroll
     */
    var lastScroll = 0,
      currentScroll;
    $(window).scroll(function() {
      // Detect where you are
      window.clearTimeout($.data("this", "scrollTimer"));
      $.data(this, "scrollTimer", window.setTimeout(function() {
        // Get current scroll position
        currentScroll = $(window).scrollTop();

        // Detect whether it's scrolling up or down by comparing current scroll location and last scroll location
        if (currentScroll > lastScroll) {
          // If it's scrolling down
          $contents.each(function(key, value) {
            if ($(value).offset().top + $(value).height() > currentScroll) {
              // Change title and URL
              changeTitleAndURL(value);
              // Quit each loop
              return false;
            }
          });
        } else if (currentScroll < lastScroll) {
          // If it's scrolling up
          $contents.each(function(key, value) {
            if ($(value).offset().top + $(value).height() - windowHeight / 2 > currentScroll) {
              // Change title and URL
              changeTitleAndURL(value);
              // Quit each loop
              return false;
            }
          });
        } else {
          // When currentScroll == lastScroll, it does not do anything because it has not been scrolled.
        }
        // Renew last scroll position
        lastScroll = currentScroll;
      }, 200));

      if ($(window).scrollTop() + windowHeight + threshold >= documentHeight) {
        // If scrolling close to the bottom

        // Getting URL from settings.nextSelector
        var $url = [$(settings.nextSelector).attr("href")];
        $(settings.nextSelector).remove();
        if ($url[0] !== undefined) {
          // If the page has link, call ajax
          if (settings.loadImage !== "") {
            $(settings.contentsWrapperSelector).append("<img src='" + settings.loadImage + "' id='cis-load-img'>");
          }
          $.ajax({
            url: $url[0],
            dataType: "html",
            success: function(res) {
              // Get title and URL
              title = $(res).filter("title").text();
              path = $url[0];
              // Set hidden span elements and history
              $(settings.contentsWrapperSelector).append($(res).find(settings.contentSelector).append(generateHiddenSpans(title, path)));
              if ($(res).find(settings.contentSelector).find(settings.nextSelector).length === 0) {
                //If there is no nextSelector in the contentSelector, get next Slecter from response and append it.
                $(settings.contentsWrapperSelector).append($(res).find(settings.nextSelector));
              }
              documentHeight = $(document).height();
              $contents = $(settings.contentSelector);
              $("#cis-load-img").remove();
              $(document).trigger('clever-infinite-scroll-content-loaded');
            }
          });
        }
      }
    }); //scroll

    return (this);
  }; //$.fn.cleverInfiniteScroll
});
