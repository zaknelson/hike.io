"use strict";
var EntryController = function($http, $log, $rootScope, $routeParams, $scope, $timeout, analytics, isEditing, navigation, resourceCache, selection) {
	$scope.hike = null;
	$scope.isDirty = false;
	$scope.isEditing = isEditing;
	$scope.isLoaded = false;
	$scope.isSaving = false;
	$scope.isJustAdded = false;
	$scope.isBeingReviewed = false;
	$scope.numPhotosUploading = 0;

	// A little tricky, maintain two versions of the photo data, the "local" version (data uri encoded, for instant preview), 
	// and the "real" version (on the $scope.hike object) which takes some time to process on the backend.
	$scope.local_photo_landscape = null;
	$scope.local_photo_facts = null;
	$scope.local_photo_preview = null;
	$scope.local_photos_generic = [];

	var lastUploadedPhotoId = 0;
	var uploadedPhotoIdMap = {};
	var canceledUploadedPhotoIdMap = {};
	var mediumEditor = null;

	var cloneToLocalPhotos = function() {
		if ($scope.hike.photo_landscape) $scope.local_photo_landscape = jQuery.extend(true, {}, $scope.hike.photo_landscape);
		if ($scope.hike.photo_facts) $scope.local_photo_facts = jQuery.extend(true, {}, $scope.hike.photo_facts);
		if ($scope.hike.photo_preview) $scope.local_photo_preview = jQuery.extend(true, {}, $scope.hike.photo_preview);
		$scope.local_photos_generic = jQuery.extend(true, [], $scope.hike.photos_generic);
	};

	var parseToFloatOrZero = function(str) {
		var result = parseFloat(str);
		if (isNaN(result)) {
			result = 0;
		}
		return result;
	};

	var normalizeHikeBeforeSave = function() {
		var hike = $scope.hike;
		// Firefox's contenteditable implementation can change these properties to strings, normalize them before uploading
		if (typeof hike.distance !== "number")				hike.distance = parseToFloatOrZero(hike.distance);
		if (typeof hike.elevation_gain !== "number")		hike.elevation_gain = parseToFloatOrZero(hike.elevation_gain);
		if (typeof hike.elevation_max !== "number")			hike.elevation_max = parseToFloatOrZero(hike.elevation_max);
		if (typeof hike.location.latitude !== "number")		hike.location.latitude = parseToFloatOrZero(hike.location.latitude);
		if (typeof hike.location.longitude !== "number")	hike.location.longitude = parseToFloatOrZero(hike.location.longitude);

		if (hike.location.latitude < -90)	hike.location.latitude = -90;
		if (hike.location.latitude >  90)	hike.location.latitude =  90;
		if (hike.location.longitude < -180)	hike.location.longitude = -180;
		if (hike.location.longitude >  180)	hike.location.longitude =  180;
	};

	$scope.$on("hikeAdded", function(event, hike, isBeingReviewed) {
		$scope.isJustAdded = true;
		$scope.isBeingReviewed = isBeingReviewed;
	});

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

			cloneToLocalPhotos();
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
		mediumEditor = new MediumEditor(".overview-description", {
			anchorInputPlaceholder: "Relative link...",
			excludedActions: ["blockquote", "u", "h4"],
			placeholder: "Enter a description of the hike..."
		});
	}


	$scope.save = function() {
		if ($scope.isEditing && $scope.isDirty && $scope.numPhotosUploading === 0) {
			$scope.isSaving = true;
			normalizeHikeBeforeSave();
			$http({method: "PUT", url: "/api/v1/hikes/" + $scope.hike.string_id, data: $scope.hike}).
				success(function(data, status, headers, config) {
					$scope.isJustAdded = false;
					if (status === 200) {
						$scope.hike = data;
						$scope.isSaving = false;
						$scope.isDirty = false;
						resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
						resourceCache.removeAllWithRoot("/api/v1/hikes");
						resourceCache.removeAllWithRoot("/api/v1/hikes/search");
					} else if (status === 202) {
						$scope.isBeingReviewed = true;
						$scope.isSaving = false;
						$scope.isDirty = false;
						// Keep this temporary version in the user's session cache, in case they decide to make other changes.
						resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
					}
					selection.clear();
					mediumEditor.hideToolbar();
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

	var orientationToRotation = function(orientation) {
		var rotation = 0;
		switch (orientation) {
		case 3:
			rotation = 180;
			break;
		case 6:
			rotation = 90;
			break;
		case 8:
			rotation = 270;
			break;
		}
		return rotation;
	};

	var previewPhoto = function(file, type, id) {
		var photo = null;
		var rotation = null;

		// TODO, is this the most efficient way to read both the data url and array buffer from the file?
		var dataUrlReader = new FileReader();
		dataUrlReader.onload = function (e) {
			$scope.$apply(function() {
				photo = { id: id, src: e.target.result };
				if (rotation) {
					photo.rotation = rotation;
				}
				switch (type) {
				case "landscape":
					$scope.local_photo_landscape = photo;
					break;
				case "facts":
					$scope.local_photo_facts  = photo;
					break;
				case "preview":
					$scope.local_photo_preview = photo;
					break;
				case "generic":
					$scope.local_photos_generic.push(photo);
					break;
				}
			});
		};
		dataUrlReader.readAsDataURL(file);

		var arrayBufferReader = new FileReader();
		arrayBufferReader.onload = function (e) {
			$scope.$apply(function() {
				/* global ExifReader: false */
				var exif = new ExifReader();
				var loaded = exif.load(e.target.result);
				if (!loaded) return;
				var orientation = exif.getTagValue("Orientation");
				rotation = orientationToRotation(orientation);
				if (photo) {
					photo.rotation = rotation;
				}
			});
		};
		arrayBufferReader.readAsArrayBuffer(file);
	};

	var doUploadPhoto = function(file, type, id) {
		var data = new FormData();
		data.append("file", file);
		$scope.numPhotosUploading++;
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
				if (canceledUploadedPhotoIdMap[id]) {
					// Local version of the photo has already been removed, don't add it.
					// numPhotosUploading should already be updated to account for the fact that this
					// upload was essentially canceled.
					return;
				}
				uploadedPhotoIdMap[id] = data;
				$scope.isDirty = true;
				$scope.numPhotosUploading--;
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
			}).
			error(function(data, status, headers, config) {
				$scope.numPhotosUploading--;
				$log.error(data, status, headers, config);
			});
	};

	$scope.uploadPhotos = function(files, type) {
		$scope.$apply(function() {
			for (var i = 0; i < files.length; i++) {
				lastUploadedPhotoId++;
				previewPhoto(files[i], type, lastUploadedPhotoId);
				doUploadPhoto(files[i], type, lastUploadedPhotoId);
			}
		});
	};

	$scope.isPhotoDataUriEncoded = function(photo) {
		return !photo.string_id;
	};

	$scope.removePhoto = function(type, index) {
		// Remove the "local" and "real" version of the photo it's possible we're trying to remove 
		// it before it's actually been process by the backend. If that happends, simply don't process
		// the photo in doUploadPhoto's callback.
		var removedPhoto = null;
		switch (type) {
		case "landscape":
			removedPhoto = $scope.local_photo_landscape;
			$scope.hike.photo_landscape = null;
			$scope.local_photo_landscape = null;
			break;
		case "facts":
			removedPhoto = $scope.local_photo_facts;
			$scope.hike.photo_facts = null;
			$scope.local_photo_facts = null;
			break;
		case "preview":
			removedPhoto = $scope.local_photo_preview;
			$scope.hike.photo_preview = null;
			$scope.local_photo_preview = null;
			break;
		case "generic":
			removedPhoto = $scope.local_photos_generic.splice(index, 1)[0];
			for (var i = 0; i < $scope.hike.photos_generic.length; i++) {
				var photo = $scope.hike.photos_generic[i];
				if (($scope.isPhotoDataUriEncoded(removedPhoto) && uploadedPhotoIdMap[removedPhoto.id] === photo) ||
					(!$scope.isPhotoDataUriEncoded(removedPhoto) && photo.string_id === removedPhoto.string_id)) {
					$scope.hike.photos_generic.splice(i, 1);
					break;
				}
			}
			break;
		}

		// If this photo hasn't yet finished uploading, cancel it
		if ($scope.isPhotoDataUriEncoded(removedPhoto) && !uploadedPhotoIdMap[removedPhoto.id]) {
			$scope.numPhotosUploading--;
			canceledUploadedPhotoIdMap[removedPhoto.id] = true;
		} else {
			$scope.isDirty = true;
		}
	};

	$scope.$on("keyboardEventSave", function(event) {
		$scope.save();
	});
};

EntryController.$inject = ["$http", "$log", "$rootScope", "$routeParams", "$scope", "$timeout", "analytics", "isEditing", "navigation", "resourceCache", "selection"];