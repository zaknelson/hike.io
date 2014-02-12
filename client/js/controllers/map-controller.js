"use strict";
var MapController = function($http, $location, $log, $scope, $timeout, analytics, config, mapTooltipFactory, navigation, resourceCache) {

	var MIN_TIME_BETWEEN_UPDATES = 100; // .1 seconds

	var socket = null;
	var defaultMarker = null;

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
		// Workflow to generate this base64 url.
		// Go into Photoshop create a document that is 28 by 28px.
		// Create a circle that is 24 with stroke of 1px and put it in the top left corner
		// Create a drop shadow (opacity: .75, distance: 2, spread: 0, size: 4)
		// Save and the minimize - https://tinypng.com/
		// Convert to base64 - http://webcodertools.com/imagetobase64converter
		var base64Icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA9lBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgJBlQHhQAAAAAAABYIRcAAAAAAAAyEw1RHxU+FxAVCAVCGRFeIxg6Fg9sKRxpKBwjDQldIxgpDwtqKBxBGREWCQYTBwVVIBYWCAZMHRRMHRRjJhphJRpeJBlGGxNoKBtlJxtrKRxVIRdkJhrrWTxtKR11LB59LyDFSzKiPirdUzipQCzkVjrpWDvWUTbdVDnRTzVmJxvlVzquQi2dPClwKh2zcEuFAAAAQHRSTlMAOicbBAoCASAQBnCEDRmWWQc0SjFVj2VtFkBDhylhdPRLd83u2qDPdpz2sGDNUsY1k7Hksn2tV2Ljscq46JnU8NToMgAAAW1JREFUKM9tk+d2gkAQhVk6gopSbKDG3k3vhQUUAcXw/i8TWBKO0b1/vzOzM3fuEqk4ljaN9QzCj7VxLTA0yxG5ONqc2xt360eBu7HfU8zlrPAUHyPrV9ExnpSKBTZjbGXiBNaJAsfghQqb1T07ofVPofPAC4W0M23Ge+tM+3jFF9N3mblnXchbVktM0ti0d5dwZy9IISk1vi2MNo+AYjjizcVB9+UqKSVmIQ6GB1lt0AT0cdCHNUBVCBjhYb3JMwQM8G3FVgK/8AN1EfzErzJGbVd4E0ZoIHWJs28goVXIBcZ4OOogEygwvTxZX2oj+wRSeT0/9lAXFWQ8U6pqU+jt8lk82C/3tOxkdJEHsnSHAuZvk4ANbvWeDLJjcwWBB5p4M+4eIDx0h/dlSdQAigkKmMBXlXZH0suJdKnTVqp/AUtriyUSKHKtLor1mnwFSBTNPNSMQJEqaLZaTaCSVBbqnLIJblB8Iqpx8h1+AKPEga5R6DIyAAAAAElFTkSuQmCC";
		defaultMarker = {
			url: base64Icon,
			anchor: new google.maps.Point(6, 6), // Not directly in the center of the icon, because the circle itself isn't in the center
			scaledSize: new google.maps.Size(14, 14),
			size: new google.maps.Size(28, 28)
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
			deactivateMarker(activeMarker);
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