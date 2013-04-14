"use strict";
var EntryController = function($scope, $http, $location, $window) {

	$scope.editing = false;
	$scope.hike = null;

	$http({method: "GET", url: "/api/v1" + $location.path()}).
		success(function(data, status, headers, config) {
			$scope.hike = data;
			$window.document.title = data.name + " - hike.io";
		}).
		error(function(data, status, headers, config) {
		});
};