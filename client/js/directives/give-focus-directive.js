"use strict";

angular.module("hikeio").
	directive("giveFocus", ["$timeout", function($timeout) {
	return {
		link: function(scope, element, attributes) {
			scope.$watch(attributes.giveFocus, function(value) {
				if (value) {
					$timeout(function() {
						element.focus();

						// Set focus to the end of the input
						// http://stackoverflow.com/questions/1056359/set-mouse-focus-and-move-cursor-to-end-of-input-using-jquery
						if (element.is("input")) {
							var val = element.val();
							element.val("");
							element.val(val);
						}
					});
				}
			});
		}
	};
}]);