"use strict";
var IndexController = function($scope, analytics, navigation, progressbar, search) {
	$scope.searchQuery = "";

	progressbar.start();
	$scope.search = function() {
		if ($scope.searchQuery.trim().length === 0) {
			navigation.toEntry("the-narrows");
		} else {
			search.search($scope.searchQuery);
		}
	};

	progressbar.complete();
	$scope.htmlReady();
};

IndexController.$inject = ["$scope", "analytics", "navigation", "progressbar", "search"];