// Google analytics
var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-33552646-1"]);
_gaq.push(["_setDomainName", "hike.io"]);
_gaq.push(["_trackPageview"]);

(function() {
	"use strict";
	
	// Google analytics
	var ga = document.createElement("script");
	ga.type = "text/javascript";
	ga.async = true;
	ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
	
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(ga, s);

	var disableNonTouchFeatures = function() {
		if (Modernizr.touch) {
			$("body").removeClass("no-touch");
		}
	};

	var initNavigation = function() {
		$(".header-div-photo-stream").click(function() {
			window.location.href = "/discover";
		});
		$(".header-div-map").click(function() {
			window.location.href = "/map";
		});
	};

	$(document).ready(function() {
		disableNonTouchFeatures();
		initNavigation();
	});
}
)();