"use strict";

angular.module("hikeio").
	factory("conversion", function() {

		var CONVERT_UNITS = {
			"meters": "feet",
			"feet": "meters",
			"kilometers": "miles",
			"miles": "kilometers",
			
			"m.": "ft.",
			"ft.": "m.",
			"km.": "mi.",
			"mi.": "km."
		};

		var EXPAND_UNITS = {
			"m.": "meters",
			"ft.": "feet",
			"km.": "kilometers",
			"mi.": "miles"
		};

		var conversionService = function() {
		};

		conversionService.prototype.getCorrespondingUnits = function(units) {
			return CONVERT_UNITS[units];
		};

		conversionService.prototype.convert = function(value, from, to, truncateTo) {
			// Cleanup input
			if (typeof value !== "number") {
				value = parseFloat(value);
			}
			if (typeof truncateTo !== "number") {
				truncateTo = parseFloat(truncateTo);
			}
			from = EXPAND_UNITS[from] || from;
			to = EXPAND_UNITS[to] || to;

			var result = value;
			if (from === "meters" && to === "feet") {
				result = value * 3.28084;
			} else if (from === "feet" && to === "meters") {
				result = value * 0.30480;
			} else if (from === "kilometers" && to === "miles") {
				result = value * 0.62137;
			} else if (from === "miles" && to === "kilometers") {
				result = value * 1.60934;
			}

			if (truncateTo) {
				result = result.toFixed(truncateTo);
			} else {
				result = Math.round(result);
			}
			return result;
		};

		return new conversionService();
	});
