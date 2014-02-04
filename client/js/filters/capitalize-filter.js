"use strict";

angular.module("hikeio").
	filter("capitalize", function() {
		return function (value) {
			return value.charAt(0).toUpperCase() + value.slice(1);
		};
	});