"use strict";

angular.module("hikeio").
	directive("mailto", function() {
		return {
			link: function (scope, element, attrs) {
				element.attr("href", "mailto:contact@hike.io");
			}
		};
	});