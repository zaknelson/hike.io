"use strict";

angular.module("hikeio").
	directive("conversion", ["$rootScope", "conversion", function($rootScope, conversion) {
		return {
			link: function(scope, element, attrs) {
				var value = attrs["value"];
				var units = attrs["units"];
				var truncateTo = attrs["truncateTo"];
				$rootScope.$watch("preferences.useMetric", function(useMetric) {
					var convertedUnits = units;
					if (!useMetric) {
						convertedUnits = conversion.getCorrespondingUnits(units);
					}
					var convertedValue = conversion.convert(value, units, convertedUnits, truncateTo);
					element.find(".units").html(convertedUnits);
					element.find(".value").html(convertedValue);
				});
			}
		};
	}]);