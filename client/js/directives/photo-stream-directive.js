"use strict";

angular.module("hikeio").
	directive("photoStream", ["$timeout", "config", function($timeout, config) {

		var template = "<div class='preview-list'>" +
			"<a href='/hikes/{{hike.string_id}}' data-ng-repeat='hike in hikes'>" +
				"<div class='preview' >" +
					"<div data-ng-class='{\"featured-box\": $first}' >" +
						"<img data-ng-src='" + config.hikeImagesPath + "/{{hike.photo_preview.string_id}}{{ $first && \"-large\" || \"\" }}.jpg'></img>" +
						"<div class='preview-footer'>" +
							"<div>" +
								"<div class='preview-title'>{{hike.name}}</div>" +
								"<div class='preview-location'>{{hike.locality}}</div>" +
							"</div>" +
							"<div>" +
								"<div class='preview-distance'>{{hike.distance | distance:\"kilometers\":\"miles\":1}} mi.</div>" +
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
				var maxColumnWidth = 350;

				element.masonry({
					itemSelector: ".preview",
					gutterWidth: gutterWidth,
					isAnimated: false,
					columnWidth: function(containerWidth) {
						var boxes = Math.ceil(containerWidth / maxColumnWidth);
						var boxWidth = Math.floor((containerWidth - (boxes - 1) * gutterWidth) / boxes);
						element.find(".preview > div").width(boxWidth);
						if (boxes !== 1) {
							element.find(".preview > .featured-box").width(boxWidth * 2 + gutterWidth);
						}
						return boxWidth;
					}
				});

				scope.$watch("hikes", function(newValue, oldValue) {
					if (newValue.length === 0) return;
					element.imagesLoaded(function(images, proper, broken) {
						$timeout(function() {
							element.masonry("reload");
						}, 100);
					});
				}, true);
			}
		};
	}]);