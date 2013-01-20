(function() {
	"use strict";
	
	var UriUtils = function() {
	};

	UriUtils.prototype.getParameterByName = function(name) {
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
		var results = regex.exec(window.location.search);
		return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "";
	};

	// Export
	window.hikeio.UriUtils = UriUtils;
})();