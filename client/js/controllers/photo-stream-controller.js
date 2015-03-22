"use strict";
angular.module("hikeio").controller("PhotoStreamController",
	["$scope", "$http", "$log", "$timeout", "analytics", "resourceCache",
	function($scope, $http, $log, $timeout, analytics, resourceCache) {

	$http({method: "GET", url: "/api/v1/hikes?fields=distance,is_featured,locality,name,photo_facts,photo_landscape,photo_preview,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			var hikes = jQuery.grep(data, function(hike) {
				return (hike.photo_preview || hike.photo_facts) && hike.is_featured;
			});
			$scope.hikes = hikes;
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});

	$scope.hikes = [];
	$scope.htmlReady();
}]);