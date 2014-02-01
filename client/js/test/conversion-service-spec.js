"use strict";
/* global beforeEach: false, describe: false, expect: false, it: false, inject: false */

describe("conversion", function() {
	beforeEach(module("hikeio"));

	describe("convert", function() {
		it("should handle basic metric -> imperial conversions", inject(function(conversion) {
			expect(conversion.convert(8, "km", "mi")).toEqual("5");
			expect(conversion.convert(1000, "meter", "feet")).toEqual("3281");
		}));
		it("should handle basic imperial -> meter conversions", inject(function(conversion) {
			expect(conversion.convert(4, "mi", "km")).toEqual("6.4");
			expect(conversion.convert(120, "feet", "meters")).toEqual("37");
		}));

		it("should show one decimal if less than 10", inject(function(conversion) {
			expect(conversion.convert(0.2, "mi", "km")).toEqual("0.3");
			expect(conversion.convert(2, "mi", "km")).toEqual("3.2");
			expect(conversion.convert(20, "mi", "km")).toEqual("32");
			expect(conversion.convert(200, "mi", "km")).toEqual("322");
		}));

		it("should support the truncateTo parameter", inject(function(conversion) {
			expect(conversion.convert(404, "ft", "m", 2)).toEqual("123.14");
			expect(conversion.convert(404, "ft", "m", 1)).toEqual("123.1");
			expect(conversion.convert(404, "ft", "m", 0)).toEqual("123");
		}));

		it("should support the hideDecimalsAt parameter", inject(function(conversion) {
			expect(conversion.convert(100, "m", "ft", 2)).toEqual("328.08");
			expect(conversion.convert(100, "m", "ft", 2, 100)).toEqual("328");
			expect(conversion.convert(10, "m", "ft", 2, 100)).toEqual("32.81");
		}));

		it("should support the showTrailingZeroes parameter", inject(function(conversion) {
			expect(conversion.convert(5, "mi", "km", 1, 100, false)).toEqual("8");
			expect(conversion.convert(5, "mi", "km", 1, 100, true)).toEqual("8.0");
		}));
	});

	describe("isMetricUnits", function() {
		it("should return true for metric units", inject(function(conversion) {
			expect(conversion.isMetricUnits("km")).toEqual(true);
			expect(conversion.isMetricUnits("m")).toEqual(true);
			expect(conversion.isMetricUnits("kilometers")).toEqual(true);
			expect(conversion.isMetricUnits("kilometer")).toEqual(true);
			expect(conversion.isMetricUnits("meters")).toEqual(true);
			expect(conversion.isMetricUnits("meter")).toEqual(true);
		}));
		it("should return false for imperial units", inject(function(conversion) {
			expect(conversion.isMetricUnits("mi")).toEqual(false);
			expect(conversion.isMetricUnits("ft")).toEqual(false);
			expect(conversion.isMetricUnits("miles")).toEqual(false);
			expect(conversion.isMetricUnits("mile")).toEqual(false);
			expect(conversion.isMetricUnits("feet")).toEqual(false);
			expect(conversion.isMetricUnits("foot")).toEqual(false);
		}));

		it("should return undefined for unhandled units", inject(function(conversion) {
			expect(conversion.isMetricUnits("furlong")).toEqual(undefined);
		}));
	});

	describe("getSingularUnits", function() {
		it("should return kilometer for plural variations", inject(function(conversion) {
			expect(conversion.getSingularUnits("km")).toEqual("kilometer");
			expect(conversion.getSingularUnits("kilometers")).toEqual("kilometer");
			expect(conversion.getSingularUnits("kilometer")).toEqual("kilometer");
		}));
		it("should return meter for plural variations", inject(function(conversion) {
			expect(conversion.getSingularUnits("m")).toEqual("meter");
			expect(conversion.getSingularUnits("meters")).toEqual("meter");
			expect(conversion.getSingularUnits("meter")).toEqual("meter");
		}));
		it("should return mile for plural variations", inject(function(conversion) {
			expect(conversion.getSingularUnits("mi")).toEqual("mile");
			expect(conversion.getSingularUnits("miles")).toEqual("mile");
			expect(conversion.getSingularUnits("mile")).toEqual("mile");
		}));
		it("should return foot for plural variations", inject(function(conversion) {
			expect(conversion.getSingularUnits("ft")).toEqual("foot");
			expect(conversion.getSingularUnits("feet")).toEqual("foot");
			expect(conversion.getSingularUnits("foot")).toEqual("foot");
		}));
		it("should return undefined for unhandled units", inject(function(conversion) {
			expect(conversion.getSingularUnits("fathoms")).toEqual(undefined);
		}));
	});

	describe("getOpposingUnits", function() {
		it("should handle km", inject(function(conversion) {
			expect(conversion.getOpposingUnits("km")).toEqual("mi");
			expect(conversion.getOpposingUnits("kilometers")).toEqual("miles");
			expect(conversion.getOpposingUnits("kilometer")).toEqual("mile");
		}));
		it("should handle m", inject(function(conversion) {
			expect(conversion.getOpposingUnits("m")).toEqual("ft");
			expect(conversion.getOpposingUnits("meters")).toEqual("feet");
			expect(conversion.getOpposingUnits("meter")).toEqual("foot");
		}));
		it("should handle mi", inject(function(conversion) {
			expect(conversion.getOpposingUnits("mi")).toEqual("km");
			expect(conversion.getOpposingUnits("miles")).toEqual("kilometers");
			expect(conversion.getOpposingUnits("mile")).toEqual("kilometer");
		}));
		it("should handle ft", inject(function(conversion) {
			expect(conversion.getOpposingUnits("ft")).toEqual("m");
			expect(conversion.getOpposingUnits("feet")).toEqual("meters");
			expect(conversion.getOpposingUnits("foot")).toEqual("meter");
		}));
		it("should return undefined for unhandled units", inject(function(conversion) {
			expect(conversion.getOpposingUnits("teaspoon")).toEqual(undefined);
		}));
	});
});