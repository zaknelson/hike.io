"use strict";
var MapController = function($location, $scope, $timeout, analytics, config, mapTooltipFactory, navigation) {

	var MIN_TIME_BETWEEN_UPDATES = 100;

	var defaultMarker = null;
	var hoverMarker = null;
	var lastMarkerUpdateTime = null;
	var socket = null;
	var mapStabilized = false;

	$scope.mapOptions = null;
	$scope.markers = [];
	$scope.activeMarker = null;
	$scope.showBanner = false;
	$scope.doneShowingBanner = false;
	$scope.formattedLocationString = null;
	$scope.searchQuery = null;
	$scope.center = null;
	$scope.zoomLevel = 0;

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

	var updateViewportToDefault = function() {
		if (google.loader.ClientLocation) {
			var clientLocation = google.loader.ClientLocation;
			$scope.center = new google.maps.LatLng(clientLocation.latitude, clientLocation.longitude);
			$scope.zoomLevel = 5;
		} else {
			// Default to a central view of the US
			$scope.center = new google.maps.LatLng(15, -90); // Center over the Americas since they have the most hikes currently.
			$scope.zoomLevel = 3;
		}
	};

	var updateViewportFromUrlParams = function(urlParams) {
		$scope.formattedLocationString = urlParams.address;
		$scope.searchQuery = urlParams.q;

		if (urlParams.lat && urlParams.lng) {
			$scope.center = new google.maps.LatLng(parseFloat(urlParams.lat), parseFloat(urlParams.lng));
			$scope.zoomLevel = parseInt(urlParams.zoom, 10) || 11;
		}

		if ($scope.searchQuery) {
			$scope.bannerString = "Unable to find location " + $scope.searchQuery;
			$scope.showBanner = true;
		}
	};

	$scope.$on("resetMapViewport", function(event, urlParams) {
		$scope.formattedLocationString = null;
		$scope.searchQuery = null;
		$scope.center = null;
		$scope.zoom = 0;
		$scope.doneShowingBanner = false;
		$scope.showBanner = false;
		mapStabilized = false;
		updateViewportFromUrlParams(urlParams);
		if (!$scope.center) {
			updateViewportToDefault();
		}
		if ($scope.activeMarker) {
			doDeactivateMarker($scope.activeMarker);
		}
		$scope.map.setCenter($scope.center);
		$scope.map.setZoom($scope.zoomLevel);
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

		if (mapStabilized && $scope.showBanner) {
			// Map is being moved, hide banner
			$scope.showBanner = false;
			$scope.doneShowingBanner = true;
			mapStabilized = false;
		}
		if (event.type === "map-idle") {
			mapStabilized = true;
			$location.search({lat: center.lat().toFixed(3), lng: center.lng().toFixed(3), zoom: zoomLevel}).replace();
		}

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
		updateViewportFromUrlParams($location.search());
		if (!$scope.center) {
			updateViewportToDefault();
		}
		$scope.mapOptions = {
			zoom: $scope.zoomLevel,
			center: $scope.center,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
	};

	var handleIncomingSocketData = function(data) {
		$scope.$apply(function() {
			if (data.length === 0) {
				if ($scope.formattedLocationString && !$scope.doneShowingBanner) {
					$scope.bannerString = "Unable to find hike near " + $scope.formattedLocationString + ". Try zooming out.";
					$scope.showBanner = true;
				}
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

MapController.$inject = ["$location", "$scope", "$timeout", "analytics", "config", "mapTooltipFactory", "navigation"];