"use strict";

angular.module("hikeio").
	directive("conversion", ["$rootScope", "conversion", function($rootScope, conversion) {
		return {
			link: function(scope, element, attrs) {
				var value = attrs.value;
				var units = attrs.units;
				var truncateTo = attrs.truncateTo;
				var hideDecimalAt = attrs.hideDecimalAt;
				var showTrailingZeroes = attrs.showTrailingZeroes;
				if (!units) return;
				$rootScope.$watch("preferences.useMetric", function(useMetric) {
					var convertedUnits = units;
					if (useMetric !== conversion.isMetricUnits(units)) {
						convertedUnits = conversion.getOpposingUnits(units);
					}
					var convertedValue = conversion.convert(value, units, convertedUnits, truncateTo, hideDecimalAt, showTrailingZeroes);
					if (convertedValue === "1") {
						convertedUnits = conversion.getSingularUnits(convertedUnits);
					}
					element.find("[data-units]").html(convertedUnits);
					element.find("[data-value]").html(convertedValue);
				});
			}
		};
	}]);