"use strict";

angular.module("hikeio").
	directive("preloadResource", ["resourceCache", function(resourceCache) {
		return {
			link: function (scope, element, attrs) {
				var json = JSON.parse(element.html());
				resourceCache.put(attrs.preloadResource, json);
			}
		};
	}]);