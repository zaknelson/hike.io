"use strict";

angular.module("hikeio").
	filter("conversion", ["conversion", "preferences", function(conversion, preferences) {
		return function (value, from, to, truncateTo) {
			var result = null;
			if (typeof value !== "number") {
				value = parseFloat(value);
			}
			if (typeof truncateTo !== "number") {
				truncateTo = parseFloat(truncateTo);
			}

			// TODO: This probably isn't the best place to put this, consider refactoring
			if (preferences.useMetric) {
				from = null;
				to = null;
			}

			result = conversion.convert(value, from, to, truncateTo);
			return result;
		};
	}]);