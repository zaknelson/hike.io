(function() {
	"use strict";
	
	var initMasonry = function() {
		$(".photo-thumb-list").imagesLoaded(function() {
			var gutterWidth = 10;
			var maxColumnWidth = 340;
			var minBoxes = 2;
			$(".photo-thumb-list").fadeIn("fast");
			$(".photo-thumb-list").masonry({
				itemSelector: ".photo-thumb",
				gutterWidth: gutterWidth,
				isAnimated: false,
				columnWidth: function(containerWidth) {
					var boxes = Math.ceil(containerWidth / maxColumnWidth);
					if (boxes < minBoxes) {
						boxes = minBoxes;
					}
					var boxWidth = Math.floor((containerWidth - (boxes - 1) * gutterWidth) / boxes);
					$(".photo-thumb").width(boxWidth);
					return boxWidth;
				}
			});
		});
	};

	var initFancybox = function() {
		$(".fancybox-thumbs").fancybox({
			padding: 10,
			nextEffect : "none",
			prevEffect : "none",
			closeEffect : "none",
			closeBtn : true,
			arrows : false,
			keys : true,
			nextClick : true
		});
	};

	var initBindings = function() {
		ko.applyBindings(new window.hikeio.HikeModel());
	}

	$(document).ready(function() {
		if ($(".hike-page").length) {
			initMasonry();
			initFancybox();
			initBindings();
		}
	});
}
)();