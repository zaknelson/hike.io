"use strict";
var EntryController = function($scope, $http, $location, $window) {

	$scope.editing = false;
	$scope.hike = null;
	$scope.hasLoaded = false;

	$http({method: "GET", url: "/api/v1" + $location.path()}).
		success(function(data, status, headers, config) {
			$scope.hike = data;
			$window.document.title = data.name + " - hike.io";
			$scope.hasLoaded = true;
		}).
		error(function(data, status, headers, config) {
		});

	$scope.isEditing = function() {
		// Tests whether location is of the form /hikes/my-hike (with no /edit at the end)
		var regex = /\/hikes\/.*?\/edit/; 
		return regex.test($location.path());
	}
};