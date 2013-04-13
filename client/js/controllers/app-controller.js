"use strict";
var AppController = function($scope, $location) {
  $scope.isSearchBoxActive = false;
  $scope.isAdmin = window.hikeio.isAdmin;

  $scope.toggleSearchBox = function() {
    $scope.isSearchBoxActive = !$scope.isSearchBoxActive;
  }

  $scope.shouldShowSearchHeader = function() {
    return $location.path() !== '/';
  }
};