"use strict";
var AllController = function($scope, $http, $log, analytics, resourceCache) {
	$scope.hikes = [];
	$scope.htmlReady();

	$http({method: "GET", url: "/api/v1/hikes?fields=locality,name,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			$scope.hikes = data;
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
		});
};

AllController.$inject = ["$scope", "$http", "$log", "analytics", "resourceCache"];