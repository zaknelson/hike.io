"use strict";
var EntryController = function($scope, $http, $location, $window, analytics, navigation) {

	$scope.editing = false;
	$scope.hike = null;
	$scope.isLoaded = false;
	$scope.isDirty = false;
	$scope.isSaving = false;

	$http({method: "GET", url: "/api/v1" + $location.path()}).
		success(function(data, status, headers, config) {
			$scope.hike = data;
			$window.document.title = data.name + " - hike.io";
			$scope.isLoaded = true;
		}).
		error(function(data, status, headers, config) {
		});

	$scope.isEditing = function() {
		return navigation.onEntryEdit();
	};

	$scope.save = function() {
		$scope.isSaving = true;
		$http({method: "PUT", url: "/api/v1/hikes/" + $scope.hike.string_id, data: $scope.hike}).
			success(function(data, status, headers, config) {
				$scope.isSaving = false;
				$scope.isDirty = false;
			}).
			error(function(data, status, headers, config) {
				$scope.isSaving = false;
				$scope.isDirty = false;
			});
	};

	$scope.done = function() {
		navigation.toEntry($scope.hike.string_id);
	};

	$scope.getMapHref = function() {
		var result = "";
		if (!$scope.isEditing()) {
			result = "/map?lat=" + $scope.hike.location.latitude + "&lng=" + $scope.hike.location.longitude;
		}
		return result;
	};

	$scope.$on("keyboardEventSave", function(event) {
		$scope.save();
	});
};

EntryController.$inject = ["$scope", "$http", "$location", "$window", "analytics", "navigation"];