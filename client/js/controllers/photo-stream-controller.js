"use strict";
var PhotoStreamController = function($scope, $http, analytics, resourceCache) {

	$http({method: "GET", url: "/api/v1/hikes", cache: resourceCache}).
		success(function(data, status, headers, config) {
			$scope.hikes = data;
		}).
		error(function(data, status, headers, config) {});

	$scope.hikes = [];
};

PhotoStreamController.$inject = ["$scope", "$http", "analytics", "resourceCache"];