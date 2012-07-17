(function() {
	var setupMasonry = function() {
		//$(".photo-thumb-list").imagesLoaded(function() {
			var gutterWidth = 1;
			var imageWidth = 340;

			$(".photo-thumb-list").fadeIn("fast");

			$(".photo-thumb-list").masonry({
				itemSelector: ".photo-thumb",
				gutterWidth: gutterWidth,
				isAnimated: true,
				animationOptions: {
					duration: 3,
					easing: "linear",
					queue: false
				},
				columnWidth: function(containerWidth) {
					if (Math.floor((containerWidth - gutterWidth) / 2) <= imageWidth) {
						box_width = Math.floor((containerWidth - gutterWidth) / 2);
					} else {
						box_width = Math.floor((containerWidth - 2 * gutterWidth) / 3);
					}	
					$(".photo-thumb").width(box_width);
					return box_width;
				}
			});
		//});

		// Sometimes the imageLoaded doesn't fire for cached images. By manually reset the src 
		// tag of the first image, we will always trigger an imageLoaded event.
		//$(".photo-thumb-list img:first").attr("src", $(".photo-thumb-list img:first").attr("src"));
	};

	$(window).load(function() {
		setupMasonry();
	});
}
)();