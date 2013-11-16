"use strict";

var _gaq = _gaq || [];

angular.module("hikeio").
	run(["$window", function($window) {
		_gaq.push(["_setAccount", "UA-33552646-1"]);
		_gaq.push(["_setDomainName", "hike.io"]);

		var ga = $window.document.createElement("script");
		ga.type = "text/javascript";
		ga.async = true;
		ga.src = ("https:" === $window.document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
		var s = $window.document.getElementsByTagName("script")[0];
		s.parentNode.insertBefore(ga, s);

	}]).
	service("analytics", ["$rootScope", "$window", "$location", "$routeParams", function($rootScope, $window, $location, $routeParams) {
		var trackPageView = function() {
			$window._gaq.push(["_trackPageview", $location.path()]);
		};

		$rootScope.$on("$viewContentLoaded", trackPageView);
	}]);