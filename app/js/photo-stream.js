(function() {

	var initMasonry = function() {
		$(".preview-list").imagesLoaded(function() {
			var gutterWidth = 2;

			var one_column_threshold = 450;
			var two_column_threshold = 340;

			console.log("Previews loaded.");

			$(".preview-list").fadeIn("fast");
			$(".preview-list").masonry({
				itemSelector: ".preview",
				gutterWidth: gutterWidth,
				isAnimated: false,
				columnWidth: function(containerWidth) {
					var one_column_width = containerWidth;
					var two_column_width = Math.floor((containerWidth - gutterWidth) / 2);
					var three_column_width = Math.floor((containerWidth - 2 * gutterWidth) / 3);
					
					if (one_column_width <= one_column_threshold) {
						box_width = one_column_width;
					} else if (two_column_width <= two_column_threshold) {
						box_width = two_column_width;
					} else {
						box_width = three_column_width;
					}
					$(".preview > div").width(box_width);

					if (box_width != one_column_width) {
						$(".featured-box").width(box_width * 2 + gutterWidth);
					}
					
					return box_width;
				}
			});
		});
	};

	var initPreviewClickHandler = function() {
		$(".preview").click(function(event) {
			window.location.href = $(event.currentTarget).attr("id").split("preview-")[1];
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
				$(newElements).imagesLoaded(function() {
					$(newElements).animate({opacity: 1});
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