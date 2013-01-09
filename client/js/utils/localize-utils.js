(function() {
	"use strict";
	
	var LocalizeUtils = function() {
	};

	LocalizeUtils.prototype.localize = function(element) {
		var value = element.attr("data-io-hike-float");
		var units = element.attr("data-io-hike-units");
		if (units === "meters") {
			return { value: this.metersToFeet(value), units: "ft." };
		} else if (units === "kilometers") {
			return { value: this.kilometersToMiles(value), units: "mi." };
		}
	};
	
	LocalizeUtils.prototype.kilometersToMiles = function(kilometers) {
		var miles = kilometers * 0.621371;
		return Math.round(miles * 10.0) / 10.0;
	};

	LocalizeUtils.prototype.metersToFeet = function(meters) {
		var feet = meters * 3.28084;
		return Math.round(feet);
	};

	// Export
	window.io.hike.LocalizeUtils = LocalizeUtils;
}
)();