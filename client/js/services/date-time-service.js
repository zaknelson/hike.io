"use strict";

angular.module("hikeio").
	factory("dateTime", ["$window", function($window) {

		var DateTimeService = function() {
		};

		var convertToDate = function(input) {
			if (input instanceof $window.Date) {
				return input;
			} else if (typeof input === "string") {
				return new $window.Date(input);
			} else {
				return null;
			}
		};

		DateTimeService.prototype.after = function(a, b) {
			a = convertToDate(a);
			b = convertToDate(b);
			if (a && b) {
				return a.getTime() > b.getTime();
			} else if (a) {
				return true;
			} else {
				return false;
			}
		};

		return new DateTimeService();
	}]);
