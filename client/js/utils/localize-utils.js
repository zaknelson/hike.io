(function() {
	"use strict";
	
	var LocalizeUtils = function() {
	};

	LocalizeUtils.prototype.localize = function(element) {
		var value = element.attr("data-hikeio-float");
		var units = element.attr("data-hikeio-units");
		if (units === "meters") {
			return { value: this.metersToFeet(value).toFixed(), units: "ft." };
		} else if (units === "kilometers") {
			return { value: this.kilometersToMiles(value).toFixed(1), units: "mi." };
		}
	};
	
	LocalizeUtils.prototype.kilometersToMiles = function(kilometers) {
		return kilometers * 0.62137;
	};

	LocalizeUtils.prototype.milesToKilometers = function(miles) {
		return miles * 1.60934;
	};

	LocalizeUtils.prototype.metersToFeet = function(meters) {
		return meters * 3.28084;
	};

	LocalizeUtils.prototype.feetToMeters = function(feet) {
		return feet * 0.30480;
	};

	// Export
	window.hikeio.LocalizeUtils = LocalizeUtils;
}
)();