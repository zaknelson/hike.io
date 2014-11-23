"use strict";
angular.module("hikeio").controller("AboutController",
	["$scope", "$window", "analytics", function($scope, $window, analytics) {
	$scope.triggerShootingStar = false;
	var lastScrollY = 0;
	$window.onscroll = function() {
		if ($scope.triggerShootingStar) {
			if ($window.pageYOffset < lastScrollY) {
				// User may want to see animation again, let them scroll up and see it.
				$scope.$apply(function() {
					$scope.triggerShootingStar = false;
				});
			}
		} else {
			if ($window.pageYOffset > lastScrollY && $window.pageYOffset > $($window).height() * 0.75) {
				$scope.$apply(function() {
					$scope.triggerShootingStar = true;
				});
			}
		}
		lastScrollY = $window.pageYOffset;
	};
	$scope.htmlReady();
}]);