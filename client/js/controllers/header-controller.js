"use strict";
var HeaderController = function($scope, $location, search) {

	$scope.searchQuery = "";

	$scope.search = function() {
		search.search($scope.searchQuery)
	};

  $scope.shouldShowSearchHeader = function() {
    return $location.path() !== '/';
  }
};