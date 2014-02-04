"use strict";
var MapController = function($location, $scope, $timeout, analytics, config, mapTooltipFactory, navigation) {

	var MIN_TIME_BETWEEN_UPDATES = 100; // .1 seconds

	var socket = null;
	var defaultMarker = null;
	var hoverMarker = null;

	var activeMarker = null;
	var lastMarkerUpdateTime = null;
	var mapStabilized = false;
	var showBanner = false;
	var doneShowingBanner = false;
	var formattedLocationString = null;
	var searchQuery = null;
	var center = null;
	var zoomLevel = 0;

	$scope.mapOptions = null;
	$scope.markers = [];

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
		updateViewport($location.search());
		$scope.mapOptions = {
			zoom: zoomLevel,
			center: center,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
	};

	var initSocketIo = function() {
		socket = io.connect(config.socketIoPath);
		socket.on("get-hikes-in-bounds", incomingSocketDataArrived);
	};

	var deactivateMarker = function(marker) {
		var tooltip = marker.tooltips.pop();
		if (tooltip) {
			tooltip.destroy();
		}
		if (marker.tooltips.length === 0) {
			marker.setIcon(defaultMarker);
		}
	};

	var activateMarker = function(marker) {
		if (activeMarker && activeMarker !== marker) {
			deactivateMarker(activeMarker);
			activeMarker = null;
		}
		var tooltip = mapTooltipFactory.create(marker);
		marker.tooltips.push(tooltip);
		marker.setIcon(hoverMarker);
		activeMarker = marker;
	};

	var updateViewportToDefault = function() {
		if (google.loader.ClientLocation) {
			var clientLocation = google.loader.ClientLocation;
			center = new google.maps.LatLng(clientLocation.latitude, clientLocation.longitude);
			zoomLevel = 5;
		} else {
			// Default to a central view of the US
			center = new google.maps.LatLng(15, -90); // Center over the Americas since they have the most hikes currently.
			zoomLevel = 3;
		}
	};

	var updateViewportFromUrlParams = function(urlParams) {
		formattedLocationString = urlParams.address;
		searchQuery = urlParams.q;

		if (urlParams.lat && urlParams.lng) {
			center = new google.maps.LatLng(parseFloat(urlParams.lat), parseFloat(urlParams.lng));
			zoomLevel = parseInt(urlParams.zoom, 10) || 11;
		}

		if (searchQuery) {
			$scope.bannerString = "Unable to find location " + searchQuery;
			showBanner = true;
		}
	};

	var updateViewport = function(urlParams) {
		updateViewportFromUrlParams(urlParams);
		if (!center) {
			updateViewportToDefault();
		}
	};

	var incomingSocketDataArrived = function(data) {
		$scope.$apply(function() {
			if (data.length === 0) {
				if (formattedLocationString && !doneShowingBanner) {
					$scope.bannerString = "Unable to find hikes near " + formattedLocationString + ". Try zooming out.";
					showBanner = true;
				}
			}
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

	$scope.$on("resetMapViewport", function(event, urlParams) {
		if (activeMarker) {
			deactivateMarker(activeMarker);
			activeMarker = null;
		}
		center = null;
		zoomLevel = 0;
		doneShowingBanner = false;
		showBanner = false;
		mapStabilized = false;
		formattedLocationString = null;
		searchQuery = null;
		lastMarkerUpdateTime = null;

		updateViewport(urlParams);
		$scope.map.setCenter(center);
		$scope.map.setZoom(zoomLevel);
	});

	$scope.markerMousedOver = function(marker) {
		activateMarker(marker);
	};

	$scope.markerMousedOut = function(marker) {
		$timeout(function() {
			deactivateMarker(marker);
		}, 300);
	};

	$scope.markerClicked = function(marker) {
		if (Modernizr.touch && marker !== activeMarker) {
			activateMarker(marker);
			// Link to the entry will be on the tooltip itself.
		} else {
			navigation.toEntry(marker.hikeData.string_id);
		}
	};

	$scope.mapMoved = function(event) {
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

		if (event.type !== "map-idle" && mapStabilized && showBanner) {
			showBanner = false; // Map is being moved, hide banner
			doneShowingBanner = true;
			mapStabilized = false;
		}
		if (event.type === "map-idle") {
			mapStabilized = true;
			$location.search({lat: center.lat().toFixed(3), lng: center.lng().toFixed(3), zoom: zoomLevel}).replace();
		}
		socket.emit("get-hikes-in-bounds", { ne: northEastLatLng, sw: southWestLatLng });
	};

	// Init
	initIcons();
	initMapOptions();
	initSocketIo();
	$scope.htmlReady();
};

MapController.$inject = ["$location", "$scope", "$timeout", "analytics", "config", "mapTooltipFactory", "navigation"];