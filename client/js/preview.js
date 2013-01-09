(function() {
	"use strict";
	
	var initLocalizedStrings = function() {
		var utils = new window.hikeio.LocalizeUtils();
		$(".preview-distance").each(function(i) {
			var element = $($(".preview-distance")[i])
			var localizedDistance = utils.localize(element);
			element.html(localizedDistance.value + " " + localizedDistance.units);
		});
	};

	$(document).ready(function() {
		if ($(".preview").length) {
			initLocalizedStrings();
		}
	});
}
)();