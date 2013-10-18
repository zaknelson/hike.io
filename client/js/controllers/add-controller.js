"use strict";
var AddController = function($http, $log, $scope, navigation, resourceCache) {
	$scope.hike = {};
	$scope.hike.location = {};

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
				$scope.hike = {};
				$scope.hike.location = {};
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			}
		);
	};
	$scope.htmlReady();
};

AddController.$inject = ["$http", "$log", "$scope", "navigation", "resourceCache"];