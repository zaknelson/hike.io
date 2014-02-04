"use strict";

angular.module("hikeio").
	service("preferences", ["persistentStorage", function(persistentStorage) {
		var self = this;

		var useMetricStoredValue = persistentStorage.get("/preferences/useMetric");
		if (useMetricStoredValue === null) {
			var clientLocation = google.loader.ClientLocation;
			if (clientLocation && clientLocation.address.country_code === "US") {
				self.useMetric = false;
			} else {
				self.useMetric = true;
			}
		} else {
			self.useMetric = useMetricStoredValue;
		}
		self.toggleUseMetric = function() {
			self.useMetric = !self.useMetric;
			persistentStorage.set("/preferences/useMetric", self.useMetric);
		};

		var searchByValue = persistentStorage.get("/preferences/searchBy");
		if (!searchByValue) {
			self.searchBy = "location";
		} else {
			self.searchBy = searchByValue;
		}
		self.toggleSearchBy = function() {
			if (self.searchBy === "location") {
				self.searchBy = "name";
			} else {
				self.searchBy = "location";
			}
			persistentStorage.set("/preferences/searchBy", self.searchBy);
		};
	}]);