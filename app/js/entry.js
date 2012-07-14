(function() {
	$(window).load(function() {
		$(".thumb-list").imagesLoaded(function() {
			var gutterWidth = 2;
			var imageWidth = 340;

			$(".thumb-list").fadeIn("slow");

			$(".thumb-list").masonry({
				itemSelector: ".thumb",
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
					$(".thumb").width(box_width);
					return box_width;
				}
			});
		});

		// Sometimes the imageLoaded doesn't fire for cached images. By manually reset the src 
		// tag of the first image, we will always trigger an imageLoaded event.
		$(".thumb-list img:first").attr("src", $(".thumb-list img").attr("src"));
	});
}
)();