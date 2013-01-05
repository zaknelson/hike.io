(function() {
	var isSearchActive = function() {
		return $(".search-div").css("display") != "none"
	}

	var toggleSearchBox = function() {
		if (isSearchActive()) {
			if (Modernizr.touch) {
				$(".search-div").css("display", "none");
				$(".search-div > input").val("");
			} else {
				$(".search-div").animate({
					marginTop: -$("header").height()
				}, 100, function() {
					$(".search-div").css("display", "none");
					$(".search-div > input").val("");
				});
			}
			$(".search-div > input").blur();
		} else {
			$(".search-div").css("display", "block");
			if (Modernizr.touch) {
				$(".search-div").css("margin-top", "0px");
			} else {
				$(".search-div").animate({
					marginTop: "0px"
				}, 100);
			}
			$(".search-div > input").focus();
		}
	}

	var initSearch = function() {
		$(".header-div-search").click(function(event) {
			toggleSearchBox();
			return false;
		});

		$(".search-div > input").keyup(function(e) {
			switch (e.keyCode) {
				case 27: // esc
					toggleSearchBox();
					break;
				case 13: // return
					var query = $.trim($(".search-div > input").val());
					if (query.length > 0) {
						window.location.href = "/?q=" + query;
					}
					break;
				default:
					break;
			}
		});

		$("body").click(function(event) {
			if (isSearchActive() && !$(event.target).closest(".search-div").length) {
				toggleSearchBox();
			}
		});
	}

	$(document).ready(function() {
		initSearch();
	});
}
)();