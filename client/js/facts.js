(function() {
	"use strict";
	
	var initLocalizedStrings = function() {
		var utils = new window.io.hike.LocalizeUtils();
		var localizedDistance = utils.localize($(".facts-hike-distance"));
		$(".facts-hike-distance-value").html(localizedDistance.value);
		$(".facts-hike-distance-units").html(localizedDistance.units);

		var localizedElevation = utils.localize($(".facts-hike-elevation"));
		$(".facts-hike-elevation-value").html(localizedElevation.value);
		$(".facts-hike-elevation-units").html(localizedElevation.units);
	};

	$(document).ready(function() {
		if ($(".overview-facts").length) {
			initLocalizedStrings();
		}
	});
}
)();