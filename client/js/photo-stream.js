(function() {
	"use strict";
	
	var initMasonry = function() {
		$(".preview-list").imagesLoaded(function() {
			var gutterWidth = 2;
			var maxColumnWidth = 350;
			$(".preview-list").fadeIn("fast");
			$(".preview-list").masonry({
				itemSelector: ".preview",
				gutterWidth: gutterWidth,
				isAnimated: false,
				columnWidth: function(containerWidth) {
					var boxes = Math.ceil(containerWidth / maxColumnWidth);
					var boxWidth = Math.floor((containerWidth - (boxes - 1) * gutterWidth) / boxes);
					$(".preview > div").width(boxWidth);
					if (boxes !== 1) {
						$(".featured-box").width(boxWidth * 2 + gutterWidth);
					}
					return boxWidth;
				}
			});
		});
	};

	var navigateToHike = function(preview) {
		window.location.href = preview.attr("id").split("preview-")[1];
	};

	var initPreviewClickHandler = function() {
		$(".preview").click(function(event) {
			navigateToHike($(event.currentTarget));
		});
	};

	var initInfiniteScroll = function() {
		$(".preview-list").infinitescroll({
				navSelector  : ".pagination-links",
				nextSelector : ".pagination-links .next_page",
				itemSelector : ".preview",
				bufferPx : 500,
				loading : {
					img : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", // transparent 1x1 gif
					msgText : "",
					finishedMsg : ""
				}
			},
			function(newElements) {
				var utils = new window.hikeio.LocalizeUtils();
				var elementsToLocalize = $(newElements).find(".preview-distance");
				elementsToLocalize.each(function(i){
					var element = $(elementsToLocalize[i]);
					var localizedDistance = utils.localize(element);
					element.html(localizedDistance.value + " " + localizedDistance.units);
				});
				$(newElements).css({opacity: 0});
				$(newElements).click(function(event) {
					navigateToHike($(event.currentTarget));
				});
				$(newElements).imagesLoaded(function() {
					$(newElements).animate({opacity: 1}, "fast", function() {
						$(newElements).css("opacity", "");
					});
					$(".preview-list").masonry("reload");
				});
			}
		);

		// trigger the first retrieval, even before the user starts scrolling
		$(".preview-list").infinitescroll("retrieve");
	};

	$(document).ready(function() {
		if ($(".photo-stream-page").length) {
			initMasonry();
			initPreviewClickHandler();
			initInfiniteScroll();
		}
	});
}
)();