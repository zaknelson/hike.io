"use strict";

angular.module("hikeio").
	directive("headerEntry", ["$document", function($document) {
		return {
			scope: {
				align: "@",
				label: "@",
				url: "@"
			},
			compile: function(tplElm, tplAttr) {
				// Include link only if url is included (otherwise, on some browsers it implies /)
				if (!tplAttr.url) {
					var link = tplElm.children()[0];
					tplElm.empty();
					tplElm.append(link.children);
				}
			},

			template: "<a href='{{url}}'>" +
				"<div data-ng-style='{float:align}' >" +
					"<div class='header-separator' data-ng-show='align == \"right\"'></div>" +
					"<div class='header-entry' data-ng-transclude>" +
						"<span class='label' data-ng-show='label'>{{label}}</span>" +
					"</div>" +
					"<div class='header-separator' data-ng-show='align == \"left\"'></div>" +
				"</div>" +
			"</a>",
			transclude: true
		};
	}]);