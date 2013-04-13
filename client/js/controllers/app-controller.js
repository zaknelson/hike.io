"use strict";
var AppController = function($scope) {
	$scope.isSearchBoxActive = false;
	$scope.isAdmin = window.hikeio.isAdmin;

	$scope.hideSearchBox = function() {
		$scope.isSearchBoxActive = false;
	};

	$scope.toggleSearchBox = function() {
		$scope.isSearchBoxActive = !$scope.isSearchBoxActive;
	}
};