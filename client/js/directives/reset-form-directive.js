"use strict";

angular.module("hikeio").
	directive("resetForm", function() {
	return {
		link: function(scope, element, attributes) {
			scope.$watch(attributes.resetForm, function(value) {
				if (value) {
					setTimeout(function() {
						element[0].reset();
					});
				}
			});
		}
	};
});