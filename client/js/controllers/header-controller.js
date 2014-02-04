"use strict";
var HeaderController = function($scope, $window, navigation, preferences, search) {
	$scope.searchQuery = "";

	$scope.search = function() {
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
		$scope.hideSearchBox(); // On the application scope, probably should be an event.
		$scope.searchQuery = "";
	};

	$scope.ignoreClickIfOnMap = function(event) {
		if (navigation.onMap()) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	};
};

HeaderController.$inject = ["$scope", "$window", "navigation", "preferences", "search"];