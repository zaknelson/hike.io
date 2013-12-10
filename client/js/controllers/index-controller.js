"use strict";
var IndexController = function($scope, $window, analytics, navigation, search) {
	$scope.searchQuery = "";
	$scope.isSearching = false;
	$scope.search = function() {
		$window.document.activeElement.blur();
		$scope.isSearching = true;
		if ($scope.searchQuery.trim && $scope.searchQuery.trim().length === 0) {
			navigation.toEntry("the-narrows");
		} else {
			search.search($scope.searchQuery).then(function() {
				$scope.isSearching = false;
			});
		}
	};

	$scope.htmlReady();
};

IndexController.$inject = ["$scope", "$window", "analytics", "navigation", "search"];