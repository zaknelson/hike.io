(function() {
	var initMasonry = function() {
		$(".photo-thumb-list").imagesLoaded(function() {
			var gutterWidth = 10;
			var imageWidth = 340;

			console.log("Photos loaded.");

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

	var initNaviationFor = function(navigationDiv, contentDiv) {
		navigationDiv.click(function() {
			$(".scroll-to-hack-div").height(1);
			var offset = contentDiv.offset();
			$("html, body").animate({
				scrollTop: offset.top - parseInt(contentDiv.css("margin-top"))
			});

		});
	};

	var initNaviation = function() {
		initNaviationFor($(".header-div-photos"), $(".photos-section"));
		initNaviationFor($(".header-div-map"), $(".map-section"));
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

	$(document).ready(function() {
		if ($(".entry-page").length) {
			initMasonry();
			initNaviation();
			initFancybox();
		}
	});
}
)();