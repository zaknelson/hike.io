"use strict";
var IndexController = function($scope, analytics, search) {
	$scope.searchQuery = "";

	$scope.search = function() {
		search.search($scope.searchQuery)
	};
};