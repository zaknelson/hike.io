"use strict";

angular.module("hikeio").
	directive("preloadResource", ["resourceCache", function(resourceCache) {
		return {
			link: function (scope, element, attrs) {
				resourceCache.put(attrs.preloadResource, element.html());
			}
		};
	}]);