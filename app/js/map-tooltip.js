(function() {

	var MapTooltip = function (entryData, marker) {
		this.entryData = entryData;
		this.marker = marker;
		this.setMap(this.marker.getMap());
		this.div = null;
	};

	MapTooltip.prototype = new google.maps.OverlayView();
	
	MapTooltip.prototype.onAdd = function() {
		this.div = $("<div></div>");
		this.div.css("position", "absolute");
		this.div.css("background", "black");

		this.getPanes().overlayLayer.appendChild(this.div[0]);
	};

	MapTooltip.prototype.draw = function() {
		var width = 100;
		var height = 100;
		var buffer = 10;

		var overlayProjection = this.getProjection();
		var markerPosition = overlayProjection.fromLatLngToContainerPixel(this.marker.getPosition());
		
		// The default location of the tooltip is centered, below the marker. If that
		// location would render the tooltip off the screen, relocate it.
		var tooltipPosition = { y: markerPosition.y + height / 2 + buffer, x: markerPosition.x - width / 2 };

		if (tooltipPosition.y + height + buffer > $(document).height()) {
			tooltipPosition.y = markerPosition.y - height / 2 - buffer;
		}

		if (tooltipPosition.x + width + buffer > $(document).width()) {
			tooltipPosition.x = markerPosition.x - width - buffer;
		}

		if (tooltipPosition.x - buffer < 0) {
			tooltipPosition.x = markerPosition.x + buffer;
		}

		this.div.offset({ top: tooltipPosition.y, left: tooltipPosition.x });
		this.div.width(width);
		this.div.height(height);
	};

	MapTooltip.prototype.onRemove = function() {
		this.div.remove();
		this.div = null;
	};

	MapTooltip.prototype.destroy = function() {
		this.setMap(null);
	};

	// Export
	window.io.hike.MapTooltip = MapTooltip;
}
)();