/**
 * jquery.clever-infinite-scroll.js
 * Working with jQuery 2.1.4
*/
/* global define, require, history, window, document, location  */
(function(root, factory){
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
	$.fn.cleverInfiteScroll = function(options) {
		/**
		 * Settings
		*/
		var defaults = {
			contentsWrapperSelector: "#contentsWrapper",
			contentSelector: ".content",
			nextSelector: "#next"
		}, settings = $.extend(defaults, options);

		/**
		 * Private methods
		*/
		var generateHiddenSpans = function(title, path) {
			return "<span class='hidden-title' style='display:none'>" + title + "</span><span class='hidden-url' style='display:none'>" + path + "</span>";
		},
		setTitleAndHistory = function(title, path) {
			// Set title
			$("title").html(title);
			// Set history
			history.pushState(null, title, path);
		},
		changeTitleAndURL = function(value) {
			// value is an element of a content user is seeing
			// Get title and path of the article page from hidden span elements
			var title = $(value).children(".hidden-title:first").text(),
				path = $(value).children(".hidden-url:first").text();
			if($("title").text() !== title) {
				// If it has changed
				setTitleAndHistory(title, path);
			}
		};

		/**
		 * Initialize
		*/
		// Get current page's title and URL.
		var title = $("title").text(),
			path = $(location).attr("href");
		// Set hidden span elements and history
		$(settings.contentSelector + ":last").append(generateHiddenSpans(title, path));
		setTitleAndHistory(title, path);

		/**
		 * scroll
		*/
		var $contents, lastScroll = 0, currentScroll;
		$(window).scroll(function() {
			// Detect where you are every 200ms
			window.clearTimeout($.data("this", "scrollTimer"));
			$.data(this, "scrollTimer", window.setTimeout(function() {
				$contents = $(settings.contentSelector);
				// Get current scroll position
				currentScroll = $(window).scrollTop();

				// Detect whether it's scrolling up or down by comparing current scroll location and last scroll location
				if(currentScroll > lastScroll) {
					// If it's scrolling down
					$contents.each(function(key, value) {
						if($(value).offset().top > $(window).scrollTop()) {
							// Change title and URL
							changeTitleAndURL(value);
							// Quit each loop
							return false;
						}
					});
				} else if(currentScroll < lastScroll) {
					// If it's scrolling up
					$contents.each(function(key, value) {
						if($(value).offset().top + $(value).height() > $(window).scrollTop()) {
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

			if($(window).scrollTop() + $(window).height() === $(document).height()) {
			// If scrolling hit the bottom
				// Getting URL from settings.nextSelector
				var $url = [$(settings.nextSelector).attr("href")];
				$(settings.nextSelector).remove();
				if($url[0] !== undefined) {
				// If the page has link, call ajax
					$.ajax({
						url: $url[0],
						dataType: "html",
						success: function(res) {
							// Get title and URL
							title = $(res).filter("title").text();
							path = $url[0];
							// Set hidden span elements and history
							$(settings.contentsWrapperSelector).append($(res).find(settings.contentSelector).append(generateHiddenSpans(title, path))).append($(res).find(settings.nextSelector));
							setTitleAndHistory(title, path);
						}
					});
				}
			}
		}); //scroll

		return (this);
	}; //$.fn.cleverInfiteScroll
});
