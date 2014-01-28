"use strict";

angular.module("hikeio").
	directive("conversion", ["$rootScope", "conversion", function($rootScope, conversion) {
		return {
			link: function(scope, element, attrs) {
				var value = attrs.value;
				var units = attrs.units;
				var truncateTo = attrs.truncateTo;
				var showTrailingZeroes = attrs.showTrailingZeroes;
				$rootScope.$watch("preferences.useMetric", function(useMetric) {
					var convertedUnits = units;
					if (useMetric !== conversion.isMetric(units)) {
						convertedUnits = conversion.getCorrespondingUnits(units);
					}
					var convertedValue = conversion.convert(value, units, convertedUnits, truncateTo, showTrailingZeroes);
					element.find("[data-units]").html(convertedUnits);
					element.find("[data-value]").html(convertedValue);
				});
			}
		};
	}]);