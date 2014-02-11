"use strict";

angular.module("hikeio").
	factory("mapTooltipFactory", ["$window", "conversion", "navigation", "preferences", function($window, conversion, navigation, preferences) {

		var MapTooltip = function(marker) {
			this.hikeData = marker.hikeData;
			this.marker = marker;
			this.map = marker.getMap();
			this.setMap(this.map);
		};

		MapTooltip.prototype = new google.maps.OverlayView();

		MapTooltip.prototype.onAdd = function() {
			this.html = $(".tooltip").clone();
			this.getPanes().floatShadow.appendChild(this.html[0]);
			var self = this;
			this.html.click(function() {
				navigation.toEntry(self.hikeData.string_id);
			});
		};

		MapTooltip.prototype.draw = function() {
			// Ideally would like to use $compile and our custom conversion directive to do this work, but map tooltip decides to draw / add at strange times
			// making it hard to tell when to compile. Doing it by hand is the expedient solution.
			this.html.find(".name").text(this.hikeData.name);
			this.html.find(".distance").text(conversion.convert(this.hikeData.distance, "km", preferences.useMetric ? "km" : "mi", 1, 10, true));
			var buffer = 10;
			var overlayProjection = this.getProjection();
			var markerPosition = overlayProjection.fromLatLngToDivPixel(this.marker.getPosition());

			// The default location of the tooltip is anchored to the bottom-right of the marker. If that
			// location would render the tooltip off the screen, relocate it.
			var tooltipOffset = {
				top: markerPosition.y + buffer,
				left: markerPosition.x + buffer
			};
			/*
			var width = this.html.outerWidth();
			var height = this.html.outerHeight();
			TODO: this logic no longer works since we're now getting the marker position with fromLatLngToDivPixel. Will need to revisit.
			if (this.html.offset().top + height + buffer > $($window.document).height()) {
				tooltipOffset.top = tooltipOffset.top - height - buffer * 2;
			}

			if (tooltipOffset.left + width + buffer > $($window.document).width()) {
				tooltipOffset.left = markerPosition.x - width - buffer;
			}*/
			this.html.css("display", "block");
			this.html[0].style.left = tooltipOffset.left + "px";
			this.html[0].style.top = tooltipOffset.top + "px";
		};

		MapTooltip.prototype.onRemove = function() {
			this.html.remove();
			this.html = null;
		};

		MapTooltip.prototype.destroy = function() {
			this.setMap(null);
		};

		var mapTooltipService = {};
		mapTooltipService.create = function(marker) {
			return new MapTooltip(marker);
		};
		return mapTooltipService;
	}]);
