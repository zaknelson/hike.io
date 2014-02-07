"use strict";

angular.module("hikeio").
	factory("mapTooltipFactory", ["$window", function($window) {

		var MapTooltip = function(marker) {
			this.hikeData = marker.hikeData;
			this.marker = marker;
			this.map = marker.getMap();
			this.setMap(this.map);
		};

		MapTooltip.prototype = new google.maps.OverlayView();

		MapTooltip.prototype.onAdd = function() {
			if (Modernizr.touch) {
				this.html = $(".touch-tooltip").clone();
			} else {
				this.html = $(".tooltip").clone();
			}
			this.getPanes().floatShadow.appendChild(this.html[0]);
		};

		MapTooltip.prototype.draw = function() {
			this.html.find(".name").text(this.hikeData.name);
			var buffer = 10;
			var width = this.html.outerWidth();
			var height = this.html.outerHeight();
			var overlayProjection = this.getProjection();
			var markerPosition = overlayProjection.fromLatLngToDivPixel(this.marker.getPosition());

			// The default location of the tooltip is anchored to the bottom-right of the marker. If that
			// location would render the tooltip off the screen, relocate it.
			var tooltipOffset = {
				top: markerPosition.y + buffer,
				left: markerPosition.x + buffer
			};
			if (tooltipOffset.top + height + buffer > $($window.document).height()) {
				tooltipOffset.top = tooltipOffset.top - height - buffer * 2;
			}

			if (tooltipOffset.left + width + buffer > $($window.document).width()) {
				tooltipOffset.left = markerPosition.x - width - buffer;
			}
			if (Modernizr.touch) {
				this.html.attr("href", "/hikes/" + this.hikeData.string_id);
			}
			this.html.css("display", "block");
			this.html[0].style.left = tooltipOffset.left + "px";
			this.html[0].style.top = tooltipOffset.top + "px";
			this.html.css("opacity", "1");
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
