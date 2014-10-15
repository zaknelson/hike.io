"use strict";
angular.module("hikeio").controller("IndexController", 
	["$scope", "$window", "analytics", "navigation", "preferences", "search",
	function($scope, $window, analytics, navigation, preferences, search) {
	
	$scope.searchQuery = "";
	$scope.isSearching = false;
	$scope.search = function() {
		$scope.isSearching = true;
		if ($scope.searchQuery.trim().length !== 0) {
			$window.document.activeElement.blur();
			if (preferences.searchBy === "location") {
				search.searchByLocation($scope.searchQuery).then(function() {
					$scope.isSearching = false;
				});
			} else {
				search.searchByName($scope.searchQuery).then(function() {
					$scope.isSearching = false;
				});
			}
		}
	};
	$scope.htmlReady();
}]);