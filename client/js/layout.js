(function() {

	var disableNonTouchFeatures = function() {
		if (Modernizr.touch) {
//			$("body").removeClass("no-touch");
		}
	};

	var initNavigation = function() {
		$(".header-div-photo-stream").click(function() {
			window.location.href = "/discover";
		});
		$(".header-div-map").click(function() {
			window.location.href = "/map";
		});
		$(".header-div-add").click(function() {
			window.location.href = "/add";
		});
	};

	var replaceSvgIfNecessary = function() {
		if (!Modernizr.svg) {
			$("svg").each(function() {
				$(this).replaceWith($("<img src=" + $(this).attr("data-hikeio-fallback-img-src") + "></img>"));
			});
		}
	};

	$(document).ready(function() {
		disableNonTouchFeatures();
		//initNavigation();
		replaceSvgIfNecessary();
	});
})();