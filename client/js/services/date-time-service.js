"use strict";

angular.module("hikeio").
	factory("dateTime", ["$window", function($window) {

		var DateTimeService = function() {
		};

		var convertToDate = function(input) {
			if (input instanceof $window.Date) {
				return input;
			} else if (typeof input === "string") {
				// Wish we could just pass the date string to Date like MDN says we can, 
				// but this doesn't work in all browsers (notably iOS), => parse it ourselves
				// Date string will be of the form: 2014-01-05 01:35:25 +0000

				var inputArray = input.split(" ");
				var date = inputArray[0];
				var time = inputArray[1];
				// Ignore timezone, this should always be +0000

				var dateArray = date.split("-");
				var year = parseInt(dateArray[0], 10);
				var month = parseInt(dateArray[1], 10);
				var day = parseInt(dateArray[2], 10);

				var timeArray = time.split(":");
				var hour = parseInt(timeArray[0], 10);
				var minute = parseInt(timeArray[1], 10);
				var second = parseInt(timeArray[2], 10);

				return new $window.Date(year, month-1, day, hour, minute, second);
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
