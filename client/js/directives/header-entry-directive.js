"use strict";

angular.module("hikeio").
	directive("headerEntry", function() {
		return {
			scope: {
				align: "@",
				label: "@",
				url: "@",
				nofollow: "@"
			},
			compile: function(tplElm, tplAttr) {
				// Include link only if url is included (otherwise, on some browsers it implies /)
				var link = tplElm.children()[0];
				if (!tplAttr.url) {
					tplElm.empty();
					tplElm.append(link.children);
				} else {
					if (tplAttr.nofollow) {
						link.setAttribute("rel", "nofollow");
					}
				}
			},

			template: "<a href='{{url}}'>" +
				"<div data-ng-style='{float:align}' >" +
					"<div class='header-separator' data-ng-show='align == \"right\"'></div>" +
					"<div class='header-entry'>" +
						"<span data-ng-transclude></span>" +
						"<span class='label' data-ng-show='label' data-ng-bind='label'></span>" +
					"</div>" +
					"<div class='header-separator' data-ng-show='align == \"left\"'></div>" +
				"</div>" +
			"</a>",
			transclude: true
		};
	});