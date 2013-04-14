"use strict";

angular.module("hikeio").
	filter("distance", function() {
	return function (value, from, to, truncateTo) {
		var result = null;

		if (from === "meters" && to === "feet") {
			result = value * 3.28084;
		} else if (from === "kilometers" && to === "miles") {
			result = value * 0.62137;
		}

		if (truncateTo) {
			result = result.toFixed(truncateTo);
		} else {
			result = Math.round(result);
		}

		return result;
	};
});