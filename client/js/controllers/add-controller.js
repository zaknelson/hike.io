"use strict";
angular.module("hikeio").controller("AddController",
	["$http", "$log", "$rootScope", "$scope", "$timeout", "$window", "capabilities", "navigation", "persistentStorage", "resourceCache", "route",
	function($http, $log, $rootScope, $scope, $timeout, $window, capabilities, navigation, persistentStorage, resourceCache, route) {

	var capitalizeWords = function(str) {
		var result = "";
		var words = str.split(" ");
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			word = word.charAt(0).toUpperCase() + word.slice(1);
			if (i !== 0) {
				word = " " + word;
			}
			result += word;
		}
		return result;
	};

	var resetScope = function() {
		$scope.hike = {};
		$scope.hike.location = {};
		$scope.isLoaded = false;
		$scope.isSubmitted = false;
		$scope.prepopulatedName = null;
		$scope.error = null;
		$scope.locatingLatLng = false;
		$scope.mapMarker = null;
		$scope.mapOptions = {
			center: new google.maps.LatLng(39.833333, -98.583333),
			zoom: 4,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			streetViewControl: false
		};
	};
	resetScope();

	$rootScope.$on("$locationChangeStart", function(event, next, current) {
		resetScope();
	});
	$scope.$on("prepopulateAddHikeName", function(event, name) {
		if (capabilities.isPrepopulatingFormsSupported) {
			$scope.prepopulatedName = capitalizeWords(name);
		}
	});
	$scope.$on("fancyboxLoaded", function() {
		$scope.$apply(function() {
			$scope.isLoaded = true;
			$scope.hike.name = $scope.prepopulatedName;
		});
	});
	$scope.$on("fancyboxClosed", function() {
		// http://stackoverflow.com/questions/12729122/prevent-error-digest-already-in-progress-when-calling-scope-apply
		if(!$scope.$$phase) {
			$scope.$apply(function() {
				resetScope();
			});
		} else {
			resetScope();
		}
	});

	$scope.attemptSubmit = function() {
		$scope.isSubmitted  = true;
	};

	$scope.readGPX = function() {
		var input = $window.document.createElement("input");
		input.type = "file";
		input.style.display = "none";
		input.addEventListener("change", function(file) {
			var promise = route.fileToGeoJSON(input.files[0]);
			promise.then(function(geoJSON) {
				var aggregateData = route.getAggregateDataFromGeoJSON(geoJSON);
				if (aggregateData.error) {
					$window.alert(aggregateData.error);
				} else {
					if (aggregateData.distance) {
						$scope.hike.distance = aggregateData.distance;
					}
					if (aggregateData.elevationGain) {
						$scope.hike.elevation_gain = aggregateData.elevationGain;
					}
					if (aggregateData.elevationMax) {
						$scope.hike.elevation_max = aggregateData.elevationMax;
					}
					if (aggregateData.firstLatLng) {
						$scope.hike.location.latitude = aggregateData.firstLatLng.latitude;
						$scope.hike.location.longitude = aggregateData.firstLatLng.longitude;
					}
				}
				$scope.hike.route = geoJSON;
			}, function(error) {
				$window.alert(error);
			});
			promise["finally"](function() {
				$window.document.body.removeChild(input);
			});
		});
		$window.document.body.appendChild(input);
		input.click();
	};

	$scope.add = function() {
		$http({method: "POST", url: "/api/v1/hikes", data: $scope.hike}).
			success(function(data, status, headers, config) {
				var id = "";
				if (status === 202) {
					id = headers("Hikeio-Hike-String-Id");
					$scope.hike.string_id = id;
					persistentStorage.set("/api/v1/hikes/" + id, $scope.hike);
				} else if (status === 200) {
					id = data.string_id;
					$scope.hike = data;
				}
				// Keep this hike in the user's session cache (even in the case when the add is under review, otherwise
				// the redirect to the entry page would fail)
				resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
				if (capabilities.isEditPageSupported) {
					navigation.toEntryEdit(id);
				} else {
					$rootScope.$broadcast("fancyboxClose");
					if (status === 202) {
						$window.alert("Nice! Your change is being reviewed and will be live soon.");
					}
					navigation.toEntry(id);
				}
				resetScope();
				$timeout(function() {
					var isBeingReviewed = (status === 202);
					$rootScope.$broadcast("hikeAdded", $scope.hike, isBeingReviewed);
				});
			}).
			error(function(data, status, headers, config) {
				if (data.message) {
					$scope.error = "Error: " + data.message;
				} else {
					$scope.error = "Error: " + status;
				}
				$log.error(data, status, headers, config);
			}
		);
	};

	$scope.locateLatLng = function() {
		$scope.locatingLatLng = true;
	};

	var hideMap = function() {
		$scope.locatingLatLng = false;
		if ($scope.mapMarker) {
			$scope.mapMarker.setMap(null);
		}
		$scope.mapMarker = null;
	};

	$scope.saveLatLng = function() {
		hideMap();
	};

	$scope.cancelLatLng = function() {
		hideMap();
		$scope.hike.location = {};
	};

	$scope.addMarker = function($event, map) {
		if ($scope.mapMarker) {
			$scope.mapMarker.setMap(null);
		}
		$scope.mapMarker = new google.maps.Marker({
			map: map,
			position: $event.latLng,
			draggable: true
		});
		$scope.hike.location.latitude = $event.latLng.lat();
		$scope.hike.location.longitude = $event.latLng.lng();
	};
}]);