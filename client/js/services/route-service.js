"use strict";

angular.module("hikeio").
	factory("route", ["$q", function($q) {

		var parseXml = function(xmlStr) {
			if (typeof window.DOMParser !== "undefined") {
				return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
			} else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
				var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlStr);
				return xmlDoc;
			} else {
				return null;
			}
		};

		// Calculates the distance between two points on a sphere
		// http://www.codecodex.com/wiki/Calculate_Distance_Between_Two_Points_on_a_Globe
		var haversineDistance = function(lat1, lng1, elv1, lat2, lng2, elv2) {
			var radius = 6371; // km
			var dLat = (lat2 - lat1) * Math.PI / 180;
			var dLon = (lng2 - lng1) * Math.PI / 180;
			var a = Math.sin(dLat / 2) * Math.sin(dLat/2) +
					Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
			var c = 2 * Math.asin(Math.sqrt(a));
			var horizontalDistance = radius * c;

			// Modification from classic Haversine. Take into account elevation and use the Pythagorean theorem
			// to calculate the real distance traveled (i.e. the hypotenuse). This is what tools like Adze use.
			if (elv1 && elv2) {
				var elevationGain = Math.abs(elv1 - elv2) / 1000.0;
				var realDistanceTraveled = Math.sqrt(d * d + elevationGain * elevationGain);
				return realDistanceTraveled;		
			} else {
				return horizontalDistance;
			}

		};

		var RouteService = function() {
		};

		RouteService.prototype.fileToGeoJSON = function(file) {
			var deferred = $q.defer();
			var routeReader = new FileReader();
			routeReader.onload = function (e) {
				/* global toGeoJSON: true */
				var name = file.name || "";
				var routeString = e.target.result;
				if (name.toLowerCase().endsWith(".geojson")) {
					deferred.resolve(JSON.parse(routeString));
				} else if (name.toLowerCase().endsWith(".gpx")) {
					var doc = parseXml(routeString);
					var geoJSON = toGeoJSON.gpx(doc);
					if (geoJSON) {
						deferred.resolve(geoJSON);
					} else {
						deferred.reject("Unable to find tracks or routes in GPX.");
					}
				} else {
					deferred.reject("Unsupported format, try .gpx or .geojson");
				}
			};
			routeReader.readAsText(file);
			return deferred.promise;
		};

		RouteService.prototype.getAggregateDataFromGeoJSON = function(geoJSON) {
			console.log(geoJSON)
			var result = {};
			if (!geoJSON.features ||
				!geoJSON.features[0] ||
				!geoJSON.features[0].geometry ||
				!geoJSON.features[0].geometry.coordinates ||
				geoJSON.features[0].geometry.coordinates.length === 0) {
				result.error = "Unable to parse route file.";
			} else {
				var coordinates = geoJSON.features[0].geometry.coordinates;
				var totalDistance = 0;
				var elevationMax = coordinates[0][2];
				var totalElevationGain = 0;
				for (var i = 1; i < coordinates.length; i++) {
					var distanceBetweenCoordinates = haversineDistance(coordinates[i][1],
						coordinates[i][0],
						coordinates[i][2],
						coordinates[i-1][1],
						coordinates[i-1][0],
						coordinates[i-1][2]);
					totalDistance += distanceBetweenCoordinates;

					if (coordinates[i][2] > elevationMax) {
						elevationMax = coordinates[i][2];
					}

					var elevationGain = coordinates[i][2] - coordinates[i-1][2];
					if (elevationGain > 0) {
						totalElevationGain += elevationGain;
					}
				}

				result.firstLatLng = { latitude: coordinates[0][1], longitude: coordinates[0][0] };
				result.distance = totalDistance;
				result.elevationMax = elevationMax;
				result.elevationGain = totalElevationGain;

			}
			return result;
		};

		return new RouteService();
	}]);