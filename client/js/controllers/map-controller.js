"use strict";
angular.module("hikeio").controller("MapController", 
	["$http", "$location", "$log", "$scope", "$timeout", "analytics", "config", "mapTooltipFactory", "navigation", "resourceCache",
	function($http, $location, $log, $scope, $timeout, analytics, config, mapTooltipFactory, navigation, resourceCache) {

	var MIN_TIME_BETWEEN_UPDATES = 100; // .1 seconds

//	var socket = null;
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
	$scope.fetchedMarkers = false;


	var initIcons = function() {
		// Source PSD is in /assets/marker.psd
		var defaultBase64Icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA9lBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAgEAAAAAAAAAAAAAAAAAAAAAAABQHhQHAgEAAAAAAAAAAABpKBtjJhoAAABoKBsAAAAAAAAAAABsKRwAAAAAAABRHxUUBwVBGRE+FxBlJhpeIxhXIRdCGREpDwtdIxg6Fg8AAABJHBMyEw0yEw0UCAVhJRpkJhpjJhoZCQZVIBYAAAAjDglVIRdYIRcjDQlMHRRaIhjrWTxtKR12LR/dVDjlVjrFSzKiPirWUTapQCzpWDt8LyDRTzV+MCFmJxtuKh2dPCnjVjquQi1GQCvOAAAAQHRSTlMAAgM6IBAaAQkFbwcnDZNZFnU0SjEpmGVAQ8eEYbNVgkv2KYbusjXa5nb2z1LNnI2vz8qkYtRXhuRUYJmOYH3v/l4HBQAAAY1JREFUOMu9k1d2wjAQRWPLapZxwfSaAqGX9J7YmF4c2P9mIkCHqu/cX92jGc08XfwrGKuUEQ6jKsbnxwqNZzNXoV/NZG8hocqJgtV4vjccBJP+aDDs5bmiHhmYPYervifor8IaijBlf66w2nzkHTCaf2pwb2D2OA28I4LpNzfwrn44806YhU0tIvpQSH7snTFuRRHZFME03lueC8veuwEpXgsk++tJGHYBImtBhZmBTBhULw2ocoHaV4FMCBZWzKZcYMifyISJnwSIcYFofl8u6CmNbIWRvISeFsKTvMmfnfAhf2ZDlGCoKR9UQjRJ7VhLNupSUTxThcaXbFkPjhgUJgi0z9d9f5MTo8YUGm73NDAVU3evIcXbdaNooR2Ol7v+xuGd6RTW6xaBiWjAenndhHYS8NCWyqZjAREYDmZQA2+62agvfH9Rr5QTN3oBbCInULgRdXNOsWMmEman6OTc6C604o4IMoBrJXVO0roE1wexF30QiIwYSKXTKRAzkPg4x1+PQBtpHGQffL0/Uk2Cqs6KqoAAAAAASUVORK5CYII=";
		var hoverBase64Icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA8FBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwXBUVEgRIOg0AAABvWhReTRFzXhZtWRRaShE1KwpXRxBCNgxjURMsJAglHgdcSxFGOg1VRhBfThJOQA5oVRNyXhVpVhRWRhAYFARqVxRoVRNpVhQaFQU5LwtEOA0YFAX/1kfwyUF1YRb40ER+aBnVsjeFbhtxXRWvkirowj62mC381EZtWRT2z0SpjCi7nC/ivT3hvTzux0HgAlxVAAAARXRSTlMAOhsHIAIQAQkEJwZKcQ0ZllkWNIQxdVWPZW1AQ8etM2Gz9PZ8J83u2s1SYJTPeOSvhuiGKZPUYleGoJib//////////p9C9ZCAAABjklEQVQ4y72TV2LCMBBEI1lWMTZgY3oJvbf0akQJNZT73yY2iGp9Z371NFrtzt79qwhhTKGuFMYI8R+rrFLOljh/zD7dY8rUG4SwSmE0He8Ww9l4Oip4yBVBAu98PXSEhmveDQUD6vlcVcqTmXOh2aSNsKKe779NBs6VBpMuwgFyfP+Zb50bbXkTBUUdKi3MHZ/mjUiIqgeD+9HKD6xGLQ3vLQh9+HUkmvYBpB7AcHYsA8Y93bXwAKs0kAGDpRm1PECBfCEDFjwJoOICFPGhHEilEd0DPzP5E0ZGAK/yIosnoC3/Zkc8ocCmvFHfokhmRRuyVtds8U2GtRbf3J5veC4mGkUoBF/+cVftvGg1cS30/m1g6gnDMyCHcYci8U8+X53qm/NqOBYX4/YsggiYH719aBc7N7S1XCJmAi8wx8hhBOKpl05xyfmyWM+FbSMOROREaDGK6HnDToRdJexYXo+cQis8giEN6GYyZRippKkD7SL2og6KoRYF6UwmDaIa9BbHt3oUWxC5gtbF6v0B+WB9k6T4OT8AAAAASUVORK5CYII=";

		defaultMarker = {
			url: defaultBase64Icon,
			anchor: new google.maps.Point(8, 8),
			scaledSize: new google.maps.Size(16, 16),
			size: new google.maps.Size(32, 32)
		};
		hoverMarker = {
			url: hoverBase64Icon,
			anchor: new google.maps.Point(8, 8),
			scaledSize: new google.maps.Size(16, 16),
			size: new google.maps.Size(32, 32)
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

/*	var initSocketIo = function() {
		socket = io.connect(config.socketIoPath);
		socket.on("get-hikes-in-bounds", incomingSocketDataArrived);
	};
*/

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
		activeMarker.setIcon(hoverMarker);
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
		updateBanner();
	};

	var updateViewport = function(urlParams) {
		updateViewportFromUrlParams(urlParams);
		if (!center) {
			updateViewportToDefault();
		}
	};

	var updateBanner = function() {
		$timeout(function() {
			// Check to see if there are any markers in this viewport, call on next event loop so that bounds are given a chance to update.
			var foundMarker = false;
			for (var i = 0; i< $scope.markers.length; i++){
				if($scope.map.getBounds() && $scope.map.getBounds().contains($scope.markers[i].getPosition())) {
					foundMarker = true;
					break;
				}
			}

			if (formattedLocationString && $scope.fetchedMarkers && !foundMarker) {
				$scope.bannerString = "Unable to find hikes near " + formattedLocationString + ". Try zooming out.";
				$scope.showBanner = true;
			}		
		});
	};

/*	var incomingSocketDataArrived = function(data) {
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
*/

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
				newLatLng = new google.maps.LatLng(newMarkers[i].location.latitude, newMarkers[i].location.longitude);
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

		//var bounds = $scope.map.getBounds();
		var center = $scope.map.getCenter();
		var zoomLevel = $scope.map.getZoom();

/*		var northEast = bounds.getNorthEast();
		var northEastLatLng = {
			latitude: northEast.lat(),
			longitude: northEast.lng()
		};
		var southWest = bounds.getSouthWest();
		var southWestLatLng = {
			latitude: southWest.lat(),
			longitude: southWest.lng()
		};
*/
		if (event.type !== "map-idle" && mapStabilized) {
			$scope.showBanner = false; // Map is being moved, hide banner
			doneShowingBanner = true;
			mapStabilized = false;
		}
		if (event.type === "map-idle") {
			mapStabilized = true;
			$location.search({lat: center.lat().toFixed(3), lng: center.lng().toFixed(3), zoom: zoomLevel}).replace();
		}
		//socket.emit("get-hikes-in-bounds", { ne: northEastLatLng, sw: southWestLatLng });
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

	// Seeing issue with socket.io on mobile and over VPN, so for now, fetch all the data over AJAX
	var initStaticData = function() {
		$http({method: "GET", url: "/api/v1/hikes", params: { fields: "distance,location,name,string_id" }, cache:resourceCache}).
			success(function(data, status, headers, config) {
				mergeMarkers(data);
				$scope.fetchedMarkers = true;
				updateBanner();
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			});
	};

	// Init
	initIcons();
	initMapOptions();
	//initSocketIo();
	initStaticData();
	$scope.htmlReady();
}]);
