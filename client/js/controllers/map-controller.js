"use strict";
var MapController = function($scope, $timeout, analytics, config, mapTooltipFactory, navigation, persistentStorage) {

	var MIN_TIME_BETWEEN_UPDATES = 100;

	var defaultMarker = null;
	var hoverMarker = null;
	var lastMarkerUpdateTime = null;
	var socket = null;

	$scope.mapOptions = null;
	$scope.markers = [];
	$scope.activeMarker = null;
	$scope.showBanner = false;
	$scope.doneShowingBanner = false;
	$scope.formattedLocationString = null;

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

	$scope.$on("resetMapViewport", function() {
		// TODO could use some refactoring
		var mapData = persistentStorage.get("/map");
		if (mapData) {
			if (mapData.viewport) {
				var viewport = mapData.viewport;
				if (viewport.southWest && viewport.northEast) {
					var southWest = new google.maps.LatLng(viewport.southWest.latitude, viewport.southWest.longitude);
					var northEast = new google.maps.LatLng(viewport.northEast.latitude, viewport.northEast.longitude);
					$scope.map.fitBounds(new google.maps.LatLngBounds(southWest, northEast));
				}
			}
			if (mapData.formattedLocationString) {
				$scope.formattedLocationString = mapData.formattedLocationString;
			}
		}
	});

	$scope.markerActivate = function(marker) {
		doActivateMarker(marker);
	};

	$scope.markerDeactivate = function(marker) {
		$timeout(function() {
			doDeactivateMarker(marker);
		}, 300);
	};

	$scope.markerClicked = function(marker) {
		if (Modernizr.touch && marker !== $scope.activeMarker) {
			doActivateMarker(marker);
			// Link to the entry will be on the tooltip itself.
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

		var bounds = $scope.map.getBounds();
		var center = $scope.map.getCenter();
		var zoomLevel = $scope.map.getZoom();

		var northEast = bounds.getNorthEast();
		var northEastLatLng = {
			latitude: northEast.lat(),
			longitude: northEast.lng()
		};
		var southWest = bounds.getSouthWest();
		var southWestLatLng = {
			latitude: southWest.lat(),
			longitude: southWest.lng()
		};

		persistentStorage.set("/map", {
			viewport: {
				latitude: center.lat(),
				longitude: center.lng(),
				zoomLevel: Math.min(zoomLevel, 9)
			}
		});
		socket.emit("get-hikes-in-bounds", { ne: northEastLatLng, sw: southWestLatLng });
	};

	var initIcons = function() {
		defaultMarker = {
			path: google.maps.SymbolPath.CIRCLE,
			fillOpacity: 1,
			fillColor: "#EB593C",
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
		var centerLatLng = new google.maps.LatLng(15, -90); // Center over the Americas since they have the most hikes currently.
		var zoomLevel = 3;

		// Attempt to zoom into the last location viewed.
		var mapData = persistentStorage.get("/map");
		if (mapData && mapData.viewport) {
			var viewport = mapData.viewport;

			// Map viewport can be defined as either by bounds (ne / sw) OR lat, lng, zoom
			if (viewport.southWest && viewport.northEast) {
				// Map options don't have a way of specifying bounds right off the bat, so set them on the next event loop
				$timeout(function() {
					var southWest = new google.maps.LatLng(viewport.southWest.latitude, viewport.southWest.longitude);
					var northEast = new google.maps.LatLng(viewport.northEast.latitude, viewport.northEast.longitude);
					$scope.map.fitBounds(new google.maps.LatLngBounds(southWest, northEast));
					$scope.doneShowingBanner = false;
				});
			} else if (viewport.latitude && viewport.longitude && viewport.zoomLevel) {
				centerLatLng = new google.maps.LatLng(viewport.latitude, viewport.longitude);
				zoomLevel = viewport.zoomLevel;
			}
			if (mapData.formattedLocationString) {
				$scope.formattedLocationString = mapData.formattedLocationString;
			}
		}

		// else if we can guess the user's location, zoom into this location
		else if (google.loader.ClientLocation) {
			var clientLocation = google.loader.ClientLocation;
			centerLatLng = new google.maps.LatLng(clientLocation.latitude, clientLocation.longitude);
			zoomLevel = 5;
		}

		$scope.mapOptions = {
			zoom: zoomLevel,
			center: centerLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
	};

	var handleIncomingSocketData = function(data) {
		$scope.$apply(function() {
			if (data.length === 0) {
				if ($scope.formattedLocationString && !$scope.doneShowingBanner) {
					$scope.showBanner = true;
				}
			} else {
				$scope.showBanner = false;
				$scope.doneShowingBanner = true;
			}
			mergeMarkers(data);
		});
	};

	var initSocketIo = function() {
		socket = io.connect(config.socketIoPath);
		socket.on("get-hikes-in-bounds", handleIncomingSocketData);
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

MapController.$inject = ["$scope", "$timeout", "analytics", "config", "mapTooltipFactory", "navigation", "persistentStorage"];