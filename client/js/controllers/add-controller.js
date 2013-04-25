"use strict";
var AddController = function($scope) {
	/*jshint camelcase:false*/

	$scope.hike = {};
	$scope.hike.location = {};

	$scope.add = function() {
		console.log($scope.hike)
	};
};

AddController.$inject = ["$scope"];