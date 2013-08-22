"use strict";
var IndexController = function($scope, analytics, navigation, progressbar, search) {
	$scope.searchQuery = "";

	$scope.search = function() {
		if ($scope.searchQuery.trim().length === 0) {
			navigation.toEntry("the-narrows");
		} else {
			search.search($scope.searchQuery);
		}
	};

	$scope.htmlReady();
};

IndexController.$inject = ["$scope", "analytics", "navigation", "progressbar", "search"];