(function() {

	var initMasonry = function() {
		$(".preview-list").imagesLoaded(function() {
			var gutterWidth = 2;
			var max_desired_column_width = 350;
			var max_width_for_one_column = 400;
			var max_width_for_two_column = 680;

			$(".preview-list").fadeIn("fast");
			$(".preview-list").masonry({
				itemSelector: ".preview",
				gutterWidth: gutterWidth,
				isAnimated: false,
				columnWidth: function(containerWidth) {
					var boxes = 0;
					if (containerWidth <= max_width_for_one_column) {
						boxes = 1;
					} else if (containerWidth <= max_width_for_two_column) {
						boxes = 2;
					} else {
						boxes = Math.ceil(containerWidth / max_desired_column_width);
					}
					box_width = Math.floor((containerWidth - (boxes - 1) * gutterWidth) / boxes);
					$(".preview > div").width(box_width);

					if (boxes != 1) {
						$(".featured-box").width(box_width * 2 + gutterWidth);
					}
					return box_width;
				}
			});
		});
	};

	var navigateToEntry = function(preview) {
		window.location.href = preview.attr("id").split("preview-")[1];
	}

	var initPreviewClickHandler = function() {
		$(".preview").click(function(event) {
			navigateToEntry($(event.currentTarget));
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
			}},
			function(newElements) {
				$(newElements).css({opacity: 0});
				$(newElements).click(function(event) {
					navigateToEntry($(event.currentTarget));
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
	}

	$(document).ready(function() {
		if ($(".photo-stream-page").length) {
			initMasonry();
			initPreviewClickHandler();
			initInfiniteScroll();
		}	
	});
}
)();