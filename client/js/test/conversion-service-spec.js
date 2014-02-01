"use strict";

describe("conversion", function() {
	beforeEach(module("hikeio"));
	describe("isMetricUnits", function() {
		it("should return true for meters", inject(function(conversion) {
			expect(conversion.isMetricUnits("km")).toEqual(true);
			expect(conversion.isMetricUnits("m")).toEqual(true);
			expect(conversion.isMetricUnits("kilometers")).toEqual(true);
			expect(conversion.isMetricUnits("kilometer")).toEqual(true);
			expect(conversion.isMetricUnits("meters")).toEqual(true);
			expect(conversion.isMetricUnits("meter")).toEqual(true);
		}));
	});
});