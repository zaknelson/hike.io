;(function() {
	"use strict";
	
	var MathUtils = function() {
	};

	MathUtils.prototype.roundTo = function(value, decimalPlaces) {
		if (typeof value === "string") {
			value = parseFloat(value);
		}
		var i = Math.pow(10, decimalPlaces);
		return Math.round((value * i)) / i;
	};

	// Export
	window.hikeio.MathUtils = MathUtils;
})();