"use strict";
var MapController = function($http, $location, $log, $scope, $timeout, analytics, config, mapTooltipFactory, navigation, resourceCache) {

	var MIN_TIME_BETWEEN_UPDATES = 100; // .1 seconds

	var socket = null;
	var defaultMarker = null;
	var hoverMarker = null;

	var activeMarker = null;
	var lastMarkerUpdateTime = null;
	var mapStabilized = false;
	var doneShowingBanner = false;
	var formattedLocationString = null;
	var searchQuery = null;
	var center = null;
	var zoomLevel = 0;

	$scope.mapOptions = null;
	$scope.markers = [];
	$scope.bannerString = null;
	$scope.showBanner = false;


	var initIcons = function() {
		defaultMarker = {
			url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAVFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADrWTwAAADpWDsnDwqEMiHFSzLkVjoGAgGIMyOrQSwIAwKLNCOsQSytQiw4iv+eAAAADnRSTlMA56+UiVsDVO4GreOoB+a9iu8AAACKSURBVBjTdZFZDsMgDEQdwmKalGHvdv97VqIoAom+zydZ9oypYc3JwHEaSxdmQ2czXWkJhJhyTjEAUjcp8Xx51/C1QLZZlLe7eBQYIsuobqCCLSkEP0ofoOiG6CYiBDHSLBOYgDzLDKzlsRhfLlqetDr+3mJ+5pj/CiG9j9Xtel1yxyrBAAv1e8cXV0kSmGSl8t0AAAAASUVORK5CYII=",
			anchor: new google.maps.Point(5, 5),
			scaledSize: new google.maps.Size(10, 10),
			size: new google.maps.Size(20, 20)
		};
		hoverMarker = {
			url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAS1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//zMAAAAFBQHh4S1TUxCqqiGJiRv6+jLa2itbWxLy8jBQUBCIiBswpy9yAAAADHRSTlMAV6dZ8alwHr53TuKCjDZsAAAApklEQVQoz3WSWRKDIBBER4OiiY/FNfc/aaJlASXwPuliBrpbbvQ4KPgMo5YU3RJoE+kNxnm77Kt3Bl5y08OxTjfrAb1cNJh5SpgNzTUfrvPIF849LW564OjOC8Y+BWvQMrJNGRujDPhc8AyisLlgUQJLLiwgsJcFxVocVV1efW79g9IVLSmaOIOu2R6CcjEoB30a7faPdrF+u6IN6I5AF8sQ66NifX4aJRcT7izi8QAAAABJRU5ErkJggg==",
			anchor: new google.maps.Point(5, 5),
			scaledSize: new google.maps.Size(10, 10),
			size: new google.maps.Size(20, 20)
		};
	};

	var initMapOptions = function() {
		updateViewport($location.search());
		$scope.mapOptions = {
			zoom: zoomLevel,
			center: center,
			scaleControl: true,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
	};

	var initSocketIo = function() {
		socket = io.connect(config.socketIoPath);
		socket.on("get-hikes-in-bounds", incomingSocketDataArrived);
	};

	var deactivateMarker = function(marker) {
		if (!marker) return;
		var tooltip = marker.tooltips.pop();
		if (tooltip) {
			tooltip.destroy();
		}
		if (marker.tooltips.length === 0) {
			marker.setIcon(defaultMarker);
		}
		hideRoute(marker);
		if (marker === activeMarker) {
			activeMarker = null;
		}
	};

	var activateMarker = function(marker) {
		marker.activationCount++;
		if (activeMarker === marker) return;
		deactivateMarker(activeMarker);
		activeMarker = marker;
		fetchRouteForActiveMarker();
		var tooltip = mapTooltipFactory.create(activeMarker);
		activeMarker.tooltips.push(tooltip);
		activeMarker.setIcon(hoverMarker);
		showRoute(activeMarker);
	};

	var showRoute = function(marker) {
		if (marker.geoJson) {
			var polylines = marker.geoJson.polylines;
			for (var i = 0 ; i < polylines.length; i++) {
				polylines[i].setMap($scope.map);
			}
		}
	};

	var hideRoute = function(marker) {
		if (marker.geoJson) {
			var polylines = marker.geoJson.polylines;
			for (var i = 0 ; i < polylines.length; i++) {
				polylines[i].setMap(null);
			}
		}
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
			$scope.bannerString = "Unable to find \"" + searchQuery + "\"";
			$scope.showBanner = true;
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
					$scope.showBanner = true;
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
					activationCount: 0,
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
		deactivateMarker(activeMarker);
		center = null;
		zoomLevel = 0;
		doneShowingBanner = false;
		$scope.showBanner = false;
		mapStabilized = false;
		formattedLocationString = null;
		searchQuery = null;
		lastMarkerUpdateTime = null;

		updateViewport(urlParams);
		$scope.map.setCenter(center);
		$scope.map.setZoom(zoomLevel);
	});

	var fetchRouteForActiveMarker = function() {
		var marker = activeMarker;
		if (marker.geoJson) return;
		$http({method: "GET", url: "/api/v1/hikes/" + marker.hikeData.string_id + "?fields=route", cache:resourceCache}).
			success(function(data, status, headers, config) {
				/* global GeoJSON: true */
				if (data.route) {
					var googleOptions = {
						strokeColor: "#EB593C",
						strokeWeight: 3,
						strokeOpacity: 0.9
					};
					var geoJson = new GeoJSON(data.route, googleOptions);
					marker.geoJson = geoJson;
					if (marker === activeMarker) {
						showRoute(marker);
					}
				}
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			});
	};

	$scope.markerMousedOver = function(marker) {
		if (!Modernizr.touch) {
			activateMarker(marker);
		}
	};

	$scope.markerMousedOut = function(marker) {
		if (!Modernizr.touch) {
			// Give the marker some time before deactivating it, otherwise with jitery mouses the tooltip / route can flicker.
			// Also, make sure the mouse hasn't reactivated again in the meantime.
			var previousActivationCount = marker.activationCount;
			$timeout(function() {
				if (previousActivationCount === marker.activationCount) {
					deactivateMarker(marker);
				}
			}, 350);
		}
	};

	$scope.markerClicked = function(marker) {
		if (!Modernizr.touch) {
			navigation.toEntry(marker.hikeData.string_id);
			return;
		}

		if (activeMarker) {
			if (marker === activeMarker) {
				navigation.toEntry(marker.hikeData.string_id);
				return;
			} else {
				deactivateMarker(marker);
			}
		}
		activateMarker(marker);
	};

	$scope.mapClicked = function(event) {
		if (Modernizr.touch) {
			deactivateMarker(activateMarker);
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
		if (event.type !== "map-idle" && mapStabilized) {
			$scope.showBanner = false; // Map is being moved, hide banner
			doneShowingBanner = true;
			mapStabilized = false;
		}
		if (event.type === "map-idle") {
			mapStabilized = true;
			$location.search({lat: center.lat().toFixed(3), lng: center.lng().toFixed(3), zoom: zoomLevel}).replace();
		}
		socket.emit("get-hikes-in-bounds", { ne: northEastLatLng, sw: southWestLatLng });
	};

	/* Having issues with testing socket on localhost, so in order to easily test, just call this function */
	/*
	var seedWithTestData = function() {
		setTimeout(function() {
			incomingSocketDataArrived([{"string_id":"scotchman-peak","name":"Scotchman Peak","latitude":48.188865,"longitude":-116.081728,"distance":12.87472}, {"string_id":"the-narrows","name":"The Narrows","latitude":37.30669,"longitude":-112.94745,"distance":24.94477}])
		});
	};
	seedWithTestData();
	*/

	// Init
	initIcons();
	initMapOptions();
	initSocketIo();
	$scope.htmlReady();
};

MapController.$inject = ["$http", "$location", "$log", "$scope", "$timeout", "analytics", "config", "mapTooltipFactory", "navigation", "resourceCache"];