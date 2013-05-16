"use strict";

angular.module("hikeio").
	directive("modelFilter", ["filterParser", function(filterParser) {
		return {
			require: "ngModel",
			link: function(scope, element, attributes, controller) {
				var applyFilter = function(value) {
					return filterParser.filter(attributes.modelFilter, value);
				}
				controller.$parsers.push(applyFilter);
				applyFilter(scope[attributes.ngModel]);
			}
		};
	}]);