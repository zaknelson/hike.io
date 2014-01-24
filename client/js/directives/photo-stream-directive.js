"use strict";

angular.module("hikeio").
	directive("photoStream", ["$rootScope", "$timeout", "$window", "capabilities", "config", function($rootScope, $timeout, $window, capabilities, config) {
		var template = "<div class='preview-list'>" +
			"<a href='/hikes/{{hike.string_id}}' data-ng-repeat='hike in hikes | limitTo:hikesToShow'>" +
				"<div class='preview preview-fade-in'>" +
					"<div data-ng-class='{\"featured-box\": isFeatured(hike, $index)}' >" +
						"<img class='preview-img' data-ng-src='{{getPreviewImageSrc(hike, $index)}}' data-aspect-ratio='{{getPreviewImageAspectRatio(hike, $index)}}' alt='{{hike.photo_preview.alt}}' />" +
						"<div class='preview-footer'>" +
							"<div>" +
								"<h4 class='preview-title'>{{hike.name}}</h4>" +
								"<h4 class='preview-location'>{{hike.locality}}</h4>" +
							"</div>" +
							"<div>" +
								"<h4 class='preview-distance'>{{hike.distance | distance:\"kilometers\":\"miles\":1}} mi.</h4>" +
							"</div>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</a>";

		return {
			replace: true,
			scope: {
				hikes: "="
			},
			template: template,
			link: function (scope, element) {
				var gutterWidth = 2;
				var maxColumnWidth = 400;
				var previewsToLoadAtATime = 5;
				var infiniteScrollDistance = 3; // 3x the height of the window
				var doneScrolling = false;
				scope.hikesToShow = 5;

				var isInViewport = function(element) {
					return element.offset().top < $($window).height();
				};

				var setupLoadHandlerForPreviewImages = function(images) {
					images.load(function() {
						var self = this;
						$timeout(function() {
							var preview = $(self).parent().parent();
							if (!isInViewport(preview)) {
								preview.removeClass("preview-fade-in"); // Remove the fade-in effect from elements that aren't in the viewport, so it's a smoother scroll
							}
							preview.css("opacity", "1");
						});
					}).each(function() {
						if (this.complete) {
							$(this).load();
						}
						$(this).attr("src", $(this).attr("src")); // Workaround for IE, otherwise the load events are not being fired for all images.
					});
				};

				var scrollHandler = function() {
					if (doneScrolling) return;
					var windowBottom = $($window).height() + $($window).scrollTop();
					var elementBottom = element.offset().top + element.height();
					var remaining = elementBottom - windowBottom;
					var shouldScroll = remaining <= $($window).height() * infiniteScrollDistance;
					if (shouldScroll) {
						scope.$apply(function() {
							scope.hikesToShow += previewsToLoadAtATime;
							if (scope.hikesToShow >= scope.hikes.length) {
								doneScrolling = true;
							}
							$timeout(function() {
								var previews = element.find(".preview:not(.masonry-brick)");
								if (previews.length === 0) return;
								var images = previews.children("div").children("img");
								setupLoadHandlerForPreviewImages(images);
								element.masonry("appended", previews);
								element.masonry("reload");
								scrollHandler(); // We might still not have a bottom, continue scrolling
							});
						});
					}
				};

				$($window).on("scroll", scrollHandler);
				scope.$on("$destroy", function() {
					return $($window).off("scroll", scrollHandler);
				});
				$timeout(function() {
					scrollHandler();
				}, 100);

				scope.isFeatured = function(hike, index) {
					if (index === 0) {
						return true;
					}
					// TODO more logic here to make other photos featured
					return false;
				};
				scope.getPreviewImageSrc = function(hike, index) {
					var photo = hike.photo_preview || hike.photo_facts;
					var useLargerImages = capabilities.hidpiSupported && !capabilities.isMobile;
					var rendition = useLargerImages ? "medium" : "small";
					if (scope.isFeatured(hike, index)) {
						rendition = useLargerImages ? "large" : "medium";
					} else if (photo.height > photo.width) {
						rendition = "medium";
					} else if (photo.width > photo.height) {
						rendition = useLargerImages ? "thumb-medium" : "thumb-small";
					}
					return config.hikeImagesPath + "/" + photo.string_id + "-" + rendition + ".jpg";
				};

				scope.getPreviewImageAspectRatio = function(hike, index) {
					var photo = hike.photo_preview || hike.photo_facts;
					var aspectRatio = photo.height / photo.width;
					if (!scope.isFeatured(hike, index) && photo.width > photo.height) {
						// Using the thumbnail version of the photo, therefore the aspect ratio will be 1:1
						aspectRatio = 1;
					}
					return aspectRatio;
				};

				scope.$watch("hikes", function(newValue, oldValue) {
					if (newValue.length === 0) return;
					$timeout(function() {

						var previews = element.find(".preview");
						var previewTitles = element.find(".preview-title");
						var previewDivs = previews.children("div");
						var images = previewDivs.children("img");
						var featuredBox = previews.children(".featured-box");
						var featuredBoxImage = featuredBox.children("img");
						setupLoadHandlerForPreviewImages(images);
						element.masonry({
							itemSelector: ".preview",
							gutterWidth: gutterWidth,
							isAnimated: false,
							columnWidth: function(containerWidth) {
								// refresh these values, they may be newly added ones after scrolling
								previews = element.find(".preview");
								previewTitles = element.find(".preview-title");
								previewDivs = previews.children("div");
								images = previewDivs.children("img");

								var boxes = Math.ceil(containerWidth / maxColumnWidth);
								var boxWidth = Math.floor((containerWidth - (boxes - 1) * gutterWidth) / boxes);

								previewTitles.width(boxWidth - 73); // 50px for the distance on the right, and 20px for the outer padding, and 3 for the inner padding
								previewDivs.width(boxWidth);
								images.each(function(i, img) {
									var aspectRatio = parseFloat($(img).attr("data-aspect-ratio"), 10);
									$(img).height(aspectRatio * boxWidth);
								});
								if (boxes !== 1) {
									featuredBox.width(boxWidth * 2 + gutterWidth);
									var aspectRatio = parseFloat(featuredBoxImage.attr("data-aspect-ratio"), 10);
									featuredBoxImage.height(aspectRatio * boxWidth * 2);
								}
								return boxWidth;
							}
						});
					});
				}, true);
			}
		};
	}]);