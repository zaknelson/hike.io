;(function() {
	"use strict";
	
	var initSearchBox = function() {
		$(".search-box").keypress(function(event) {
			if (event.keyCode === 13) { // return
				var query = $.trim($(".search-box").val());
				if (query.length > 0) {
					window.location.href = "/?q=" + query;
				}
			}
		});
	};

	$(document).ready(function() {
		if ($(".index-page").length) {
			initSearchBox();
		}
	});
})();