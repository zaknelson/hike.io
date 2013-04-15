"use strict";

angular.module("hikeio").
	filter("distance", function() {
	return function (value, from, to, truncateTo) {
		var result = null;

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
});