"use strict";
var EntryController = function($http, $log, $rootScope, $routeParams, $scope, $timeout, analytics, isEditing, navigation, resourceCache) {

	$scope.hike = null;
	$scope.isDirty = false;
	$scope.isEditing = isEditing;
	$scope.isLoaded = false;
	$scope.isSaving = false;
	$scope.isBeingReviewed = false;

	var disableLinksIfEditing = function(data) {
		if ($scope.hike.description && $scope.isEditing) {
			$scope.hike.description = $scope.hike.description.replace(/href/g, "data-href");
		}
	};

	$http({method: "GET", url: "/api/v1/hikes/" + $routeParams.hikeId, cache:resourceCache}).
		success(function(data, status, headers, config) {
			$scope.hike = data;
			$rootScope.title = $scope.hike.name + " - hike.io";
			var haveSetMetaDescription = false;
			if ($scope.hike.description) {
				var description = $scope.hike.description;
				if (description.indexOf("<p>") === 0 && description.indexOf("</p>") > 0) {
					$rootScope.metaDescription = description.substring("<p>".length, description.indexOf("</p>"));
					haveSetMetaDescription = true;
				}
			}

			if (!haveSetMetaDescription) {
				$rootScope.metaDescription = $scope.hike.name + " is a hike in " + $scope.hike.locality + ".";
			}

			disableLinksIfEditing();
			$scope.isLoaded = true;
			$scope.htmlReady();
		}).
		error(function(data, status, headers, config) {
			$log.error(data, status, headers, config);
		}
	);

	if (isEditing) {
		/* jshint nonew: false, undef: false */
		/* global MediumEditor: false */
		new MediumEditor(".overview-description", {
			anchorInputPlaceholder: "Relative link...",
			excludedActions: ["u", "h4"],
			placeholder: "",
			delay: 100
		});
	}


	$scope.save = function() {
		if ($scope.isDirty) {
			$scope.isSaving = true;
			$http({method: "PUT", url: "/api/v1/hikes/" + $scope.hike.string_id, data: $scope.hike}).
				success(function(data, status, headers, config) {
					if (status === 200) {
						$scope.hike = data;
						$scope.isSaving = false;
						$scope.isDirty = false;
						resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
						resourceCache.put("/api/v1/hikes", null);
						disableLinksIfEditing();
					} else if (status === 202) {
						$scope.isBeingReviewed = true;
						$scope.isSaving = false;
						$scope.isDirty = false;
					}
				}).
				error(function(data, status, headers, config) {
					$log.error(data, status, headers, config);
				});
		}
	};

	$scope.done = function() {
		navigation.toEntry($scope.hike.string_id);
	};

	$scope.getMapHref = function() {
		var result = "";
		if (!$scope.isEditing) {
			result = "/map?lat=" + $scope.hike.location.latitude + "&lng=" + $scope.hike.location.longitude;
		}
		return result;
	};

	var doUploadPhoto = function(file, type) {
		var data = new FormData();
		data.append("file", file);
		$http({
				method: "POST",
				url: "/api/v1/hikes/" + $scope.hike.string_id + "/photos",
				data: data,
				headers: { "Content-Type": false },
				transformRequest: function(data) {
					return data;
				}
			}).
			success(function(data, status, headers, config) {
				switch (type) {
				case "landscape":
					$scope.hike.photo_landscape = data;
					break;
				case "facts":
					$scope.hike.photo_facts = data;
					break;
				case "preview":
					$scope.hike.photo_preview = data;
					break;
				case "generic":
					$scope.hike.photos_generic.push(data);
					break;
				}
				$scope.isDirty = true;
			}).
			error(function(data, status, headers, config) {
				$log.error(data, status, headers, config);
			});
	};

	$scope.uploadPhotos = function(files, type) {
		$scope.$apply(function() {
			for (var i = 0; i < files.length; i++) {
				doUploadPhoto(files[i], type);
			}
		});
	};

	$scope.removePhoto = function(type, photo) {
		switch (type) {
		case "landscape":
			$scope.hike.photo_landscape = null;
			break;
		case "facts":
			$scope.hike.photo_facts = null;
			break;
		case "preview":
			$scope.hike.photo_preview = null;
			break;
		case "generic":
			$scope.hike.photos_generic.splice($scope.hike.photos_generic.indexOf(photo), 1);
			break;
		}
		$scope.isDirty = true;
	};

	$scope.$on("keyboardEventSave", function(event) {
		$scope.save();
	});
};

EntryController.$inject = ["$http", "$log", "$rootScope", "$routeParams", "$scope", "$timeout", "analytics", "isEditing", "navigation", "resourceCache"];