"use strict";
var AddController = function($http, $log, $rootScope, $scope, $timeout, navigation, resourceCache) {

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
	};
	resetScope();

	$rootScope.$on("$locationChangeStart", function (event, next, current) {
		resetScope();
	});
	$scope.$on("prepopulateAddHikeName", function(event, name) {
		$scope.hike.name = capitalizeWords(name);
	});
	$scope.$on("fancyboxLoaded", function() {
		$scope.$apply(function() {
			$scope.isLoaded = true;
		});
	});
	$scope.$on("fancyboxClosed", function() {
		$scope.$apply(function() {
			$scope.isLoaded = false;
		});
	});

	$scope.attemptSubmit = function() {
		$scope.isSubmitted  = true;
	};

	$scope.add = function() {
		$http({method: "POST", url: "/api/v1/hikes", data: $scope.hike}).
			success(function(data, status, headers, config) {
				var id = "";
				if (status === 202) {
					// The logic for converting name into id needs to stay in sync with the same function on the server
					id = $scope.hike.name.toLowerCase().replace(/#/g, "").split(" ").join("-");
					$scope.hike.string_id = id;
				} else if (status === 200) {
					id = data.string_id;
					$scope.hike = data;
				}
				// Keep this hike in the user's session cache (even in the case when the add is under review, otherwise
				// the redirect to the entry page would fail)
				resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
				navigation.toEntryEdit(id);
				resetScope();
				$timeout(function() {
					var isBeingReviewed = (status === 202);
					$rootScope.$broadcast("hikeAdded", $scope.hike, isBeingReviewed);
				});
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			}
		);
	};
	$scope.htmlReady();
};

AddController.$inject = ["$http", "$log", "$rootScope", "$scope", "$timeout", "navigation", "resourceCache"];