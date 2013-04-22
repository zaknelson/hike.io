"use strict";
var HeaderController = function($scope, search) {
	$scope.searchQuery = "";

	$scope.search = function(event) {
		search.search($scope.searchQuery);
		$scope.searchQuery = "";
	};
};

HeaderController.$inject = ["$scope", "search"];