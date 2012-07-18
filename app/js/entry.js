(function() {
	var setupPhotoMasonry = function() {
		console.log("setting up photo masonry");
		$(".photo-thumb-list").imagesLoaded(function() {
			var gutterWidth = 1;
			var imageWidth = 340;

			console.log("photos loaded.");
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
		});


	};

	$(window).load(function() {
		setupPhotoMasonry();
	});
}
)();