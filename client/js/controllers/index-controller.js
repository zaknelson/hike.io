"use strict";
var IndexController = function($scope, search) {
	$scope.searchQuery = "";

	$scope.search = function() {
		search.search($scope.searchQuery)
	};
};