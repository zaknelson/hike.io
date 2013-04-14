"use strict";

// http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
angular.module("hikeio").
	directive("giveFocus", function() {
	return {
		scope: { giveFocus: "=" },
		link: function(scope, element) {
			scope.$watch("giveFocus", function(value) {
				if(value) { 
					element.focus();
				}
			});
		}
	};
});