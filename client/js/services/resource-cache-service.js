"use strict";

angular.module("hikeio").
	factory("resourceCache", ["$cacheFactory", function($cacheFactory) {
		return $cacheFactory("resourceCache");
	}]);