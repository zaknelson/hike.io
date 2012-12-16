(function() {

	var map = null;
	var markers = [];

	var initMap = function() {
		// Default to a central view of the US
		var centerLatLng = new google.maps.LatLng(39.833333, -98.583333);
		var zoomLevel = 4;

		// If we can guess the user's location, zoom into this level instead
		if (google.loader.ClientLocation) {
			var clientLocation = google.loader.ClientLocation;
			centerLatLng = new google.maps.LatLng(clientLocation.latitude, clientLocation.longitude);
			zoomLevel = 7;
		}

		var mapOptions = {
			zoom: zoomLevel,
			center: centerLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		}

		map = new google.maps.Map($(".map-page")[0], mapOptions);

		$(".map-page").resize(function() {
			console.log("Resizing map")
			google.maps.event.trigger(map, "resize");
		});
	};

	var compareLatLng = function(a, b) {
		if (a.lat() < b.lat()) 			{ return -1; }
		else if (a.lat() > b.lat()) 	{ return 1;  }
		else if (a.lng() < b.lng()) 	{ return -1; }
		else if (a.lng() > b.lng()) 	{ return 1;  }
		else 							{ return 0;  }
	};

	var handleGetHikesInBoundsResponse = function(data) {
		var i = 0, j = 0;
		var newMarkers = [];
		while (i != data.length || j != markers.length) {
			var newLatLng = null, oldMarker = null, oldLatLng = null;;

			if (i < data.length) {
				newLatLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);
			}
			if (j < markers.length) {
				oldMarker = markers[j];
				oldLatLng = oldMarker.getPosition();
			}
			
			if (!oldLatLng || (newLatLng && compareLatLng(newLatLng, oldLatLng) < 0)) {
				// This is a brand new marker, add it
				var marker = new google.maps.Marker({
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						fillOpacity: 1,
						fillColor: "ff6262",
						strokeWeight: 1.0, 
						scale: 4
					  },
					map: map,
					position: newLatLng
				});
				newMarkers.push(marker);
				i++;
			} else if (!newLatLng || (oldLatLng && compareLatLng(newLatLng, oldLatLng) > 0)) {
				// The old marker is no longer in use, remove it
				oldMarker.setMap(null);
				j++;
			} else {
				// Use the existing marker
				newMarkers.push(oldMarker);
				i++;
				j++;
			}
		}
			markers = newMarkers;
	}

	var initSocketIo = function() {
		var socket = io.connect(location.protocol + "//" + location.hostname + ":8080");
		google.maps.event.addListener(map, "idle", function() {
			var mapBounds = map.getBounds();
			var northEast = mapBounds.getNorthEast();
			var northEastLatLng = { latitude: northEast.lat(), longitude: northEast.lng() };
			var southWest = mapBounds.getSouthWest();
			var southWestLatLng = { latitude: southWest.lat(), longitude: southWest.lng() };
			socket.emit("get-hikes-in-bounds", { ne:northEastLatLng, sw:southWestLatLng });
		});
		
		socket.on("get-hikes-in-bounds", function (data) {
			handleGetHikesInBoundsResponse(data);
		});
	};

	$(document).ready(function() {
		if ($(".map-page").length) {
			initMap();
			initSocketIo();
		}
	});
}
)();