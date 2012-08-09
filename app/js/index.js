(function() {
	var setupMasonry = function() {
		$(".preview-box-list").imagesLoaded(function() {
			var gutterWidth = 2;

			var one_column_threshold = 450;
			var two_column_threshold = 340;

			console.log("Previews loaded.");

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
					
					if (one_column_width <= one_column_threshold) {
						box_width = one_column_width;
					} else if (two_column_width <= two_column_threshold) {
						box_width = two_column_width;
					} else {
						box_width = three_column_width;
					}
					$(".preview-box img").width(box_width);

					if (box_width != one_column_width) {
						$(".featured-box img").width(box_width * 2 + gutterWidth);
					}
					
					return box_width;
				}
			});
		});
	};

	var setupPreviewClickHandler = function() {
		$(".preview-box").click(function(event) {
			window.location.href = $(event.currentTarget).attr("id").split("preview-box-")[1];
		});
	};

	var setupMap = function(navigationDiv, contentDiv) {
		$(".header-div-map").click(function(event) {
			alert("ASDF")
		});
	};

	$(document).ready(function() {
		if ($("#index-page").length) {
			setupMasonry();
			setupPreviewClickHandler();
			setupMap();
		}	
	});
}
)();