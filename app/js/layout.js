var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-33552646-1"]);
_gaq.push(["_setDomainName", "hike.io"]);
_gaq.push(["_trackPageview"]);

(function() {
	var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
	ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
	var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);

	var disableNonTouchFeatures = function() {
		if ("ontouchstart" in document) {
    		$("body").removeClass("no-touch");
		}
	};

	var isSearchActive = function() {
		return $(".search-input-div").css("display") != "none"
	}

	var toggleSearchBox = function() {
		if (isSearchActive()) {
			$(".search-input-div").css("display", "none");
			$(".search-input").val("");
			$(".search-input").blur();
		} else {
			$(".search-input-div").css("display", "block");
			$(".search-input").focus();
		}
	}

	var setupSearch = function() {
		$(".header-div-search").click(function(event) {
			toggleSearchBox();
			return false;
		});

		$(".search-input").keyup(function(e) {
			switch (e.keyCode) {
				case 27: // esc
				case 13: // return
					toggleSearchBox();
					break;
				default:
					break;
			}
		});

		$("body").click(function(event) {
			if (isSearchActive() && !$(event.target).closest(".search-input-div").length) {
				toggleSearchBox();
			}
		});
	}

	$(document).ready(function() {
		disableNonTouchFeatures();
		setupSearch();
	});
}
)();