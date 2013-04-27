"use strict";
var PhotoStreamController = function($scope, $http, $log, analytics, resourceCache) {

	$http({method: "GET", url: "/api/v1/hikes", cache: resourceCache}).
		success(function(data, status, headers, config) {
			// Only show the hikes that have photo previews
			var hikes = jQuery.grep(data, function(hike){
				return hike.photo_preview;
			});
			$scope.hikes = hikes;
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});

	$scope.hikes = [];
};

PhotoStreamController.$inject = ["$scope", "$http", "$log", "analytics", "resourceCache"];