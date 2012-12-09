(function() {

	var initSearchBox = function() {
		$(".search-box").keypress(function(event) {
			if (event.keyCode == 13) { // return
				window.location.href = "?q=" + $(".search-box").val();
			}
		});
	}
	$(document).ready(function() {
		if ($(".index-page").length) {
			initSearchBox();
		}
	});
}
)();