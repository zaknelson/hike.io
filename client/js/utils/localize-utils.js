(function() {
	"use strict";
	
	var LocalizeUtils = function() {
	};

	LocalizeUtils.prototype.localize = function(elements) {
		if (typeof elements === "undefined") {
			elements = $("[data-io-hike-distance-meters], [data-io-hike-distance-kilometers]");
		}

		var that = this;
		elements.each(function(i) {
			var element = $(elements[i]);
			var meters = element.attr("data-io-hike-distance-meters");
			var kilometers = element.attr("data-io-hike-distance-kilometers");
			if (typeof meters !== "undefined") {
				element.html(that.metersToFeet(meters) + " ft.")
			} else if (typeof kilometers !== "undefined") {
				element.html(that.kilometersToMiles(kilometers) + " mi.")
			}
		});
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