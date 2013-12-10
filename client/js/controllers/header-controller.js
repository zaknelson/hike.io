"use strict";
var HeaderController = function($scope, $window, search) {
	$scope.searchQuery = "";

	$scope.search = function(event) {
		$window.document.activeElement.blur();
		search.search($scope.searchQuery);
		$scope.searchQuery = "";
	};
};

HeaderController.$inject = ["$scope", "$window", "search"];