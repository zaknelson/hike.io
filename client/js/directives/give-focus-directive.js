"use strict";

angular.module("hikeio").
	directive("giveFocus", function() {
	return {
		link: function(scope, element, attributes) {
			scope.$watch(attributes.giveFocus, function(value) {
				if (value) { 
					setTimeout(function() {
						element.focus();
					});
				}
			});
		}
	};
});