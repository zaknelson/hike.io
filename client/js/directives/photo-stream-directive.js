"use strict";

angular.module("hikeio").
	directive("photoStream", ["$rootScope", "$timeout", "config", function($rootScope, $timeout, config) {
		var normalImage = "small";
		var biggerImage = "medium";
		var template = "<div class='preview-list'>" +
			"<a href='/hikes/{{hike.string_id}}' data-ng-repeat='hike in hikes'>" +
				"<div class='preview'>" +
					"<div data-ng-class='{\"featured-box\": $first}' >" +
						"<img class='preview-img' data-ng-src='" + config.hikeImagesPath + "/{{hike.photo_preview.string_id}}{{ $first && \"-" + biggerImage + "\" || \"-" + normalImage + "\" }}.jpg' data-aspect-ratio='{{hike.photo_preview.height / hike.photo_preview.width}}' alt='{{hike.photo_preview.alt}}'></img>" +
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
				scope.$watch("hikes", function(newValue, oldValue) {
					if (newValue.length === 0) return;
					$timeout(function() {
						element.find(".preview > div > img").load(function() {
							var preview = $(this).parent().parent();
							preview.css("opacity", "1");
							$timeout(function() {
								preview.addClass("no-transition");
								preview.hover(function() {
									preview.css("opacity", ".95");
								}, function() {
									preview.css("opacity", "1");
								});
							}, 400);
						}).each(function() {
							if (this.complete) {
								$(this).load();
							}
							$(this).attr("src", $(this).attr("src")); // Workaround for IE, otherwise the load events are not being fired for all images.
						});
						element.masonry({
							itemSelector: ".preview",
							gutterWidth: gutterWidth,
							isAnimated: true,
							columnWidth: function(containerWidth) {
								var boxes = Math.ceil(containerWidth / maxColumnWidth);
								var boxWidth = Math.floor((containerWidth - (boxes - 1) * gutterWidth) / boxes);

								element.find(".preview-title").width(boxWidth - 73); // 50px for the distance on the right, and 20px for the outer padding, and 3 for the inner padding

								// TODO: clean up these selectors
								element.find(".preview > div").width(boxWidth);
								element.find(".preview > div > img").each(function(i, img) {
									var aspectRatio = parseFloat($(img).attr("data-aspect-ratio"), 10);
									$(img).height(aspectRatio * boxWidth);
								});
								if (boxes !== 1) {
									element.find(".preview > .featured-box").width(boxWidth * 2 + gutterWidth);
									var featuredBoxImage = element.find(".preview > .featured-box > img");
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