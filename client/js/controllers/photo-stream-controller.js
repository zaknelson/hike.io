"use strict";
var PhotoStreamController = function($scope, $http, analytics) {

	$http({method: "GET", url: "/api/v1/hikes"}).
		success(function(data, status, headers, config) {
			$scope.hikes = data;
		}).
		error(function(data, status, headers, config) {
		});

	$scope.hikes = [];
};

PhotoStreamController.$inject = ["$scope", "$http", "analytics"];