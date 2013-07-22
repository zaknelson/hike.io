"use strict";

angular.module("hikeio").
	directive("mailto", function() {
		return {
			link: function (scope, element, attrs) {
				// Obfuscate mailto:contact@hike.io
				element.attr("href", atob("bWFpbHRvOmNvbnRhY3RAaGlrZS5pbw=="));
			}
		};
	});