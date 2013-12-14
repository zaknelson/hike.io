"use strict";
var PhotoStreamController = function($scope, $http, $log, $timeout, analytics, resourceCache) {

	$http({method: "GET", url: "/api/v1/hikes?fields=distance,locality,name,photo_facts,photo_preview,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			// Only show the hikes that have photo previews or facts photo, which is a backup option
			var hikes = jQuery.grep(data, function(hike){
				return hike.photo_preview || hike.photo_facts;
			});
			$scope.hikes = hikes;
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});

	$scope.hikes = [];
	$scope.htmlReady();
};

PhotoStreamController.$inject = ["$scope", "$http", "$log", "$timeout", "analytics", "resourceCache"];