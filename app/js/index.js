(function() {
	var setupMasonry = function() {
		$(".preview-box-list").imagesLoaded(function() {
			var gutterWidth = 1;
			var imageWidth = 340;

			$(".preview-box-list").fadeIn("fast");

			$(".preview-box-list").masonry({
				itemSelector: ".preview-box",
				gutterWidth: gutterWidth,
				isAnimated: true,
				animationOptions: {
					duration: 0,
					easing: "linear",
					queue: false
				},
				columnWidth: function(containerWidth) {
					var one_column_width = containerWidth;
					var two_column_width = Math.floor((containerWidth - gutterWidth) / 2);
					var three_column_width = Math.floor((containerWidth - 2 * gutterWidth) / 3);
					
					if (one_column_width <= imageWidth) {
						box_width = one_column_width;
					} else if (two_column_width <= imageWidth) {
						box_width = two_column_width;
					} else {
						box_width = three_column_width;
					}
					$(".preview-box img").width(box_width);
					return box_width;
				}
			});
		});

		// Sometimes the imageLoaded doesn't fire for cached images. By manually reset the src 
		// tag of the first image, we will always trigger an imageLoaded event.
		$(".preview-box-list img:first").attr("src", $(".preview-box-list img:first").attr("src"))
	};

	var setupPreviewClickHandler = function() {
		$(".preview-box").click(function(event) {
			window.location.href = $(event.currentTarget).attr("id").split("preview-box-")[1];
		});
	};

	$(window).load(function() {
		setupMasonry();
		setupPreviewClickHandler();
	});
}
)();