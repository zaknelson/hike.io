"use strict";
var EntryController = function($scope, $http, $location, $window) {

	$scope.editing = false;
	$scope.hike = null;
	$scope.isLoaded = false;
	$scope.isDirty = false;
	$scope.isSaving = false;

	$http({method: "GET", url: "/api/v1" + $location.path()}).
		success(function(data, status, headers, config) {
			$scope.hike = data;
			$window.document.title = data.name + " - hike.io";
			$scope.isLoaded = true;
		}).
		error(function(data, status, headers, config) {
		});

	$scope.isEditing = function() {
		// Tests whether location is of the form /hikes/my-hike (with no /edit at the end)
		var regex = /\/hikes\/.*?\/edit/; 
		return regex.test($location.path());
	};

	$scope.save = function() {
		$scope.isSaving = true;
		$http({method: "PUT", url: "/api/v1/hikes/" + $scope.hike.string_id, data: $scope.hike}).
			success(function(data, status, headers, config) {
				$scope.isSaving = false;
				$scope.isDirty = false;
			}).
			error(function(data, status, headers, config) {
				$scope.isSaving = false;
				$scope.isDirty = false;
			});
	};


	$scope.done = function() {
		$location.path("/hikes/" + $scope.hike.string_id);
	};
};