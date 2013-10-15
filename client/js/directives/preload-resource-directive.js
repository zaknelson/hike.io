"use strict";

angular.module("hikeio").
	directive("preloadResource", ["resourceCache", function(resourceCache) {
		return {
			link: function (scope, element, attrs) {
				// # HACKY, browser is doing some processing on the html before I can get to it, 
				// even though it is properly escaped on the backend.
				var unescaped = element.html().replace(/<a href="\\&quot;/g, "<a href=\\\"");
				unescaped = unescaped.replace(/\\&quot;">/g, "\\\">");
				resourceCache.put(attrs.preloadResource, unescaped);
			}
		};
	}]);