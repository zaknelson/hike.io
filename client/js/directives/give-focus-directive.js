"use strict";

angular.module("hikeio").
	directive("giveFocus", ["$timeout", function($timeout) {
	return {
		link: function(scope, element, attributes) {
			scope.$watch(attributes.giveFocus, function(value) {
				if (value) {
					$timeout(function() {
						element.focus();
					});
				}
			});
		}
	};
}]);