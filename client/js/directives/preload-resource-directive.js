"use strict";

angular.module("hikeio").
	directive("preloadResource", ["resourceCache", function(resourceCache) {
		return {
			link: function (scope, element, attrs) {
				// # HACKY, browser is doing some processing on the html before I can get to it, 
				// even though it is properly escaped on the backend.
				console.log(element.html());
				var unescaped = element.html().replace(/"\\&quot;|\\&quot;"|'\\"/g, "\\\"").replace(/&amp;/g, "&");
				console.log(unescaped);
				resourceCache.put(attrs.preloadResource, unescaped);
			}
		};
	}]);