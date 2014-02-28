"use strict";
/* global beforeEach: false, describe: false, expect: false, it: false, inject: false */

describe("dateTime", function() {
	beforeEach(module("hikeio"));

	describe("after", function() {

		var validateBeforeAndAfter = function(dateTime, before, after) {
			expect(dateTime.after(after, before)).toEqual(true);
			expect(dateTime.after(before, after)).toEqual(false);
		};

		it("should return correctly handle two properly formatted dates", inject(function(dateTime) {
			validateBeforeAndAfter(dateTime,"2000-01-01 01:00:00 +0000",
											"2001-01-01 01:00:00 +0000");

			validateBeforeAndAfter(dateTime,"2000-01-01 01:00:00 +0000",
											"2000-02-01 01:00:00 +0000");

			validateBeforeAndAfter(dateTime,"2000-01-01 01:00:00 +0000",
											"2000-01-02 01:00:00 +0000");

			validateBeforeAndAfter(dateTime,"2000-01-01 01:00:00 +0000",
											"2000-01-01 02:00:00 +0000");

			validateBeforeAndAfter(dateTime,"2000-01-01 01:00:00 +0000",
											"2000-01-01 01:01:00 +0000");

			validateBeforeAndAfter(dateTime,"2000-01-01 01:00:00 +0000",
											"2000-01-01 01:00:01 +0000");
		}));

		it("should return true if there is no second parameter", inject(function(dateTime) {
			expect(dateTime.after("2000-01-01 01:00:00 +0000", null)).toEqual(true);
		}));

		it("should return false if there is no first parameter", inject(function(dateTime) {
			expect(dateTime.after(null, "2000-01-01 01:00:00 +0000")).toEqual(false);
		}));

		it("should return false if there is neither parameter", inject(function(dateTime) {
			expect(dateTime.after(null, null)).toEqual(false);
		}));

		it("should be able to handle Date input", inject(function(dateTime) {
			validateBeforeAndAfter(dateTime, new Date(2001, 0, 1, 1, 0, 0), new Date(2002, 0, 1, 1, 0, 0));
		}));
	});

});