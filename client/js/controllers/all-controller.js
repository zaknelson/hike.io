"use strict";
angular.module("hikeio").controller("AllController", 
	["$scope", "$http", "$log", "analytics", "resourceCache", function($scope, $http, $log, analytics, resourceCache) {
	
	$scope.hikes = [];

	$http({method: "GET", url: "/api/v1/hikes?fields=locality,name,photo_facts,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			$scope.hikes = data;
			$scope.htmlReady();
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});
}]);