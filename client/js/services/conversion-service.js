"use strict";

angular.module("hikeio").
	factory("conversion", function() {

		var CORRESPONDING_UNITS = {
			meters: "feet",
			feet: "meters",
			kilometers: "miles",
			miles: "kilometers"
		};

		var conversionService = function() {
		};

		conversionService.prototype.getCorrespondingUnits = function(units) {
			return CORRESPONDING_UNITS[units];
		};

		conversionService.prototype.convert = function(value, from, to, truncateTo) {
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
