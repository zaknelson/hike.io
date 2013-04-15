"use strict";
var HeaderController = function($scope, $location, search) {
	$scope.searchQuery = "";

	$scope.search = function(event) {
		search.search($scope.searchQuery)
		$scope.searchQuery = "";
	};

	$scope.shouldShowSearchHeader = function() {
		return $location.path() !== "/";
	}

	$scope.shouldShowEditHeader = function() {
		// Tests whether location is of the form /hikes/my-hike (with no /edit at the end)
		var regex = /\/hikes\/(?!.*\/edit$)/; 
		return regex.test($location.path());
	}
};