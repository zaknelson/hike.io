"use strict";
var MapController = function($scope, $location, $timeout, analytics, config, mapTooltipFactory, navigation) {

	var MIN_TIME_BETWEEN_UPDATES = 100;

	var defaultMarker = null;
	var hoverMarker = null;
	var lastMarkerUpdateTime = null;
	var socket = null;

	$scope.mapOptions = null;
	$scope.markers = [];
	$scope.activeMarker = null;

	var doDeactivateMarker = function(marker) {
		var tooltip = marker.tooltips.pop();
		if (tooltip) {
			tooltip.destroy();
		}
		if (marker.tooltips.length === 0) {
			marker.setIcon(defaultMarker);
		}
	};

	var doActivateMarker = function(marker) {
		if ($scope.activeMarker && $scope.activeMarker !== marker) {
			doDeactivateMarker($scope.activeMarker);
			$scope.activeMarker = null;
		}
		var tooltip = mapTooltipFactory.create(marker);
		marker.tooltips.push(tooltip);
		marker.setIcon(hoverMarker);
		$scope.activeMarker = marker;
	};

	$scope.markerActivate = function(marker) {
		doActivateMarker(marker);
	};

	$scope.markerDeactivate = function(marker) {
		$timeout(function() {
			doDeactivateMarker(marker);
		}, 300);
	};

	$scope.markerClicked = function(marker) {
		if (Modernizr.touch) {
			doActivateMarker(marker);
			marker.tooltips[0].div.click(function() {
				navigation.toEntry(marker.hikeData.string_id);
			});
		} else {
			navigation.toEntry(marker.hikeData.string_id);
		}
	};

	$scope.updateMarkers = function(event) {
		if (lastMarkerUpdateTime &&
				event.type !== "map-idle" &&
				event.timestamp - lastMarkerUpdateTime < MIN_TIME_BETWEEN_UPDATES) {
			// Recently updated, ignore this update request
			return;
		}

		lastMarkerUpdateTime = event.timestamp;
		var mapBounds = $scope.map.getBounds();
		var northEast = mapBounds.getNorthEast();
		var northEastLatLng = {
			latitude: northEast.lat(),
			longitude: northEast.lng()
		};
		var southWest = mapBounds.getSouthWest();
		var southWestLatLng = {
			latitude: southWest.lat(),
			longitude: southWest.lng()
		};
		socket.emit("get-hikes-in-bounds", { ne: northEastLatLng, sw: southWestLatLng });
	};

	var initIcons = function() {
		defaultMarker = {
			path: google.maps.SymbolPath.CIRCLE,
			fillOpacity: 1,
			fillColor: "#FF6262",
			strokeWeight: 1.0,
			scale: 4
		};
		hoverMarker = {
			path: google.maps.SymbolPath.CIRCLE,
			fillOpacity: 1,
			fillColor: "#FFFF33",
			strokeWeight: 1.0,
			scale: 5
		};
	};

	var initMapOptions = function() {
		// Default to a central view of the US
		var centerLatLng = new google.maps.LatLng(39.833333, -98.583333);
		var zoomLevel = 4;

		// If the url parameters lat / lng are set, zoom in there
		var urlParams = $location.search();
		var latString = urlParams.lat;
		var lngString = urlParams.lng;
		if ($.isNumeric(latString) && $.isNumeric(lngString)) {
			var lat = Number(latString);
			var lng = Number(lngString);
			centerLatLng = new google.maps.LatLng(lat, lng);
			zoomLevel = 12;
		}

		// else if we can guess the user's location, zoom into this location
		else if (google.loader.ClientLocation) {
			var clientLocation = google.loader.ClientLocation;
			centerLatLng = new google.maps.LatLng(clientLocation.latitude, clientLocation.longitude);
			zoomLevel = 7;
		}

		$scope.mapOptions = {
			zoom: zoomLevel,
			center: centerLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
	};

	var initSocketIo = function() {
		socket = io.connect(config.socketIoPath);
		socket.on("get-hikes-in-bounds", function (data) {
			mergeMarkers(data);
		});
	};

	var compareLatLng = function(a, b) {
		if		(a.lat() < b.lat())		{	return -1;	}
		else if (a.lat() > b.lat())		{	return 1;	}
		else if (a.lng() < b.lng())		{	return -1;	}
		else if (a.lng() > b.lng())		{	return 1;	}
		else							{	return 0;	}
	};

	var mergeMarkers = function(newMarkers) {
		var i = 0;
		var j = 0;
		var mergedMarkers = [];
		while (i !== newMarkers.length || j !== $scope.markers.length) {
			var newLatLng = null;
			var oldMarker = null;
			var oldLatLng = null;

			if (i < newMarkers.length) {
				newLatLng = new google.maps.LatLng(newMarkers[i].latitude, newMarkers[i].longitude);
			}

			if (j < $scope.markers.length) {
				oldMarker = $scope.markers[j];
				oldLatLng = oldMarker.getPosition();
			}

			if (!oldLatLng || (newLatLng && compareLatLng(newLatLng, oldLatLng) < 0)) {
				// This is a brand new marker, add it
				var marker = new google.maps.Marker({
					icon: defaultMarker,
					map: $scope.map,
					position: newLatLng,
					hikeData: newMarkers[i],
					tooltips: []
				});
				mergedMarkers.push(marker);
				i++;
			} else if (!newLatLng || (oldLatLng && compareLatLng(newLatLng, oldLatLng) > 0)) {
				// The old marker is no longer in use, remove it
				oldMarker.setMap(null);
				j++;
			} else {
				// Use the existing marker
				mergedMarkers.push(oldMarker);
				i++;
				j++;
			}
		}
		$scope.markers = mergedMarkers;
	};

	// Init
	initIcons();
	initMapOptions();
	initSocketIo();
	$scope.htmlReady();
};

MapController.$inject = ["$scope", "$location", "$timeout", "analytics", "config", "mapTooltipFactory", "navigation"];