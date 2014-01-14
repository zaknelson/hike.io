"use strict";
var AboutController = function($scope, $window, analytics) {
	$scope.scrolledToSubPageTwo = false;
	$window.onscroll = function() {
		if (!$scope.scrolledToSubPageTwo && $window.pageYOffset > $($window).height() * 0.75) {
			$scope.$apply(function() {
				$scope.scrolledToSubPageTwo = true;
			});
		}
	};
	$scope.htmlReady();
};

AboutController.$inject = ["$scope", "$window", "analytics"];