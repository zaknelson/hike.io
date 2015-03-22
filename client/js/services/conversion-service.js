"use strict";

angular.module("hikeio").
	factory("conversion", function() {

		var ConversionService = function() {
			this.unitFormats = {};
			var formats = ["abbreviated", "singular", "plural"];
			this.units = {
				"Kilometer":	{ type: "Kilometer",	abbreviated: "km",		singular : "kilometer",	plural: "kilometers",	isMetric: true,		opposition: "Mile",			ratio: 0.62137119223 },
				"Meter":		{ type: "Meter",		abbreviated: "m",		singular : "meter",		plural: "meters",		isMetric: true,		opposition: "Feet",			ratio: 3.28083989501 },
				"Mile":			{ type: "Mile",			abbreviated: "mi",		singular : "mile",		plural: "miles",		isMetric: false,	opposition: "Kilometer",	ratio: 1.609344 },
				"Feet":			{ type: "Feet",			abbreviated: "ft",		singular : "foot",		plural: "feet",			isMetric: false,	opposition: "Meter",		ratio: 0.3048 }
			};

			for (var unit in this.units) {
				if (this.units.hasOwnProperty(unit)) {
					for (var j = 0; j < formats.length; j++) {
						var format = formats[j];
						this.unitFormats[this.units[unit][format]] = {
							unit: unit,
							format: format
						};
					}
				}
			}
		};

		ConversionService.prototype.parseUnits = function(unitStr) {
			if (!unitStr) return;
			var unitFormats = this.unitFormats[unitStr];
			if (unitFormats) return this.units[unitFormats.unit];
		};

		ConversionService.prototype.getOpposingUnits = function(unitStr) {
			if (!unitStr) return;
			var unitFormats = this.unitFormats[unitStr];
			if (!unitFormats) return;
			var format = unitFormats.format;
			var unit = unitFormats.unit;
			var opposition = this.units[unit].opposition;
			return this.units[opposition][format];
		};

		ConversionService.prototype.isMetricUnits = function(unitStr) {
			var units = this.parseUnits(unitStr);
			if (units) return units.isMetric;
		};

		ConversionService.prototype.getSingularUnits = function(unitStr) {
			var units = this.parseUnits(unitStr);
			if (units) return units.singular;
		};

		ConversionService.prototype.convert = function(value, from, to, truncateTo, hideDecimalAt, showTrailingZeroes) {
			if (value === null) return null;
			value = parseFloat(value);
			from = this.parseUnits(from);
			to = this.parseUnits(to);
			truncateTo = parseFloat(truncateTo);
			hideDecimalAt = parseFloat(hideDecimalAt);
			if (from !== to && from.opposition !== to.type) return value;
			var result = value;
			if (from !== to) {
				result = value * from.ratio;
			}
			var stringResult = null;
			if (!isNaN(truncateTo)) {
				stringResult = result.toFixed(truncateTo);
			} else {
				if (result < 10) {
					stringResult = result.toFixed(1);
				} else {
					stringResult = Math.round(result).toString();
				}
			}
			if (!showTrailingZeroes) {
				stringResult = parseFloat(stringResult, 10).toString();
			}
			if (hideDecimalAt && parseFloat(stringResult, 10) >= hideDecimalAt) {
				stringResult = Math.round(result).toString();
			}
			return stringResult;
		};

		return new ConversionService();
	});
