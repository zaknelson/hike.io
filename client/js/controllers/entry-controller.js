"use strict";
var EntryController = function($filter, $http, $log, $rootScope, $routeParams, $scope, $timeout, $window, analytics, config, dateTime, isEditing, navigation, persistentStorage, resourceCache, selection) {
	// TODO this file really needs to be cleaned up

	var MAX_PHOTOS_TO_UPLOAD_AT_ONCE = 4;
	var MAX_UPLOAD_PHOTO_WIDTH = 2400;
	var MAX_UPLOAD_PHOTO_HEIGHT = 2400;

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
	var uploadingPhotoIdMap = {}; // "local" photos that are uploading or uploaded
	var uploadedPhotoIdMap = {}; // "real" photos that are uploaded
	var canceledUploadedPhotoIdMap = {}; // photos that havent finished uploading and are already removed
	var descriptionMediumEditor = null;
	var permitMediumEditor = null;

	var cloneToLocalPhotos = function() {
		$scope.local_photo_landscape = $scope.hike.photo_landscape;
		$scope.local_photo_facts = $scope.hike.photo_facts;
		$scope.local_photo_preview = $scope.hike.photo_preview;
		$scope.local_photos_generic = [];
		for (var i = 0; $scope.hike.photos_generic && i < $scope.hike.photos_generic.length; i++) {
			$scope.local_photos_generic.push($scope.hike.photos_generic[i]);
		}
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

	var getMetaDescriptionFromHikeDescription = function(description) {
		var firstParagraph = description.substring("<p>".length, description.indexOf("</p>"));
		var div = $window.document.createElement("div");
		div.innerHTML = firstParagraph;
		return div.innerText;
	};

	var getMetaImagePathFromPhoto = function(photo) {
		return config.hikeImagesPath + "/" + photo.string_id + "-thumb-medium.jpg";
	};

	var getMetaImageFromHike = function(hike) {
		if (hike.photo_facts) {
			return getMetaImagePathFromPhoto(hike.photo_facts);
		} else if (hike.photo_preview) {
			return getMetaImagePathFromPhoto(hike.photo_preview);
		} else if (hike.photo_landscape) {
			return getMetaImagePathFromPhoto(hike.photo_landscape);
		} else if (hike.photos_generic && hike.photos_generic.length > 0) {
			return getMetaImagePathFromPhoto(hike.photos_generic[0]);
		} else {
			return null;
		}
	};

	$scope.$on("hikeAdded", function(event, hike, isBeingReviewed) {
		$scope.isJustAdded = true;
		$scope.isBeingReviewed = isBeingReviewed;
	});

	if ($rootScope.isProduction) {
		var beforeUnloadFunction = function() {
			return "You have unsaved changes.";
		};

		$scope.$watch("isDirty", function() {
			if ($scope.isDirty) {
				$window.onbeforeunload = beforeUnloadFunction;
			} else {
				$window.onbeforeunload = null;
			}
		});

		// Ideally would be able to use onbeforeunload, but that doesn't work for single page apps.
		$scope.$on("$locationChangeStart", function(event) {
			if ($scope.isDirty) {
				if ($window.confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
					$window.onbeforeunload = null;
				} else {
					event.preventDefault();
				}
			} else {
				$window.onbeforeunload = null;
			}
		});
	}

	var routeId = "/api/v1/hikes/" + $routeParams.hikeId;
	$http({method: "GET", url: "/api/v1/hikes/" + $routeParams.hikeId, cache:resourceCache}).
		success(function(data, status, headers, config) {
			var hike = data;
			var cachedHike = persistentStorage.get(routeId);
			if (status === 202) {
				if (!cachedHike) {
					$log.error(data, status, headers, config);
					return;
				}
				// Hike doesn't exist yet but there is a pending POST to make it so. If this is the user that made the change, they'd
				// like to be able to see their change, so retrieve it from local storage
				hike = cachedHike;
			} else if (status === 200) {
				if (cachedHike) {
					if (dateTime.after(data.edit_time, cachedHike.edit_time)) {
						persistentStorage.remove(routeId);
					} else {
						hike = cachedHike;
					}
				}
			}

			$scope.hike = hike;
			$rootScope.title = $scope.hike.name + " - hike.io";
			$rootScope.metaImage = getMetaImageFromHike(hike);
			var haveSetMetaDescription = false;
			if ($scope.hike.description) {
				var description = $scope.hike.description;
				if (description.indexOf("<p>") === 0 && description.indexOf("</p>") > 0) {
					$rootScope.metaDescription = getMetaDescriptionFromHikeDescription(description);
					haveSetMetaDescription = true;
				}
			}

			if (!haveSetMetaDescription) {
				var filter = $filter("distance");
				var distance = filter($scope.hike.distance, "kilometers", "miles", 1);
				var elevationGain = filter($scope.hike.elevation_gain, "meters", "feet", 0);
				var elevationMax = filter($scope.hike.elevation_max, "meters", "feet", 0);
				$rootScope.metaDescription = $scope.hike.name + " is a " + distance +  " mile hike in " + $scope.hike.locality + ". " +
					"The hike gains " + elevationGain + " feet and reaches a maximum elevation of " + elevationMax + " feet. It doesn't yet have a description, but you can fix that by editing the page.";
			}

			cloneToLocalPhotos();
			$scope.isLoaded = true;
			$scope.htmlReady();
		}).
		error(function(data, status, headers, config) {
			persistentStorage.remove(routeId);
			$log.error(data, status, headers, config);
		}
	);

	if (isEditing) {
		/* jshint nonew: false, undef: false */
		/* global MediumEditor: false */
		descriptionMediumEditor = new MediumEditor(".overview-description", {
			anchorInputPlaceholder: "Enter a link...",
			excludedActions: ["blockquote", "u", "h4"],
			placeholder: "Enter a description of the hike..."
		});


		permitMediumEditor = new MediumEditor(".hike-permit", {
			anchorInputPlaceholder: "Enter a link...",
			excludedActions: ["b", "blockquote", "h3", "h4", "i", "u"],
			placeholder: ""
		});
	}


	$scope.save = function() {
		$scope.isSaving = true;
		$scope.isDirty = false;
		normalizeHikeBeforeSave();
		$http({method: "PUT", url: "/api/v1/hikes/" + $scope.hike.string_id, data: $scope.hike}).
			success(function(data, status, headers, config) {
				$scope.isJustAdded = false;
				$scope.isSaving = false;
				if (status === 200) {
					$scope.hike = data;
					resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
					resourceCache.removeAllWithRoot("/api/v1/hikes");
					resourceCache.removeAllWithRoot("/api/v1/hikes/search");
				} else if (status === 202) {
					$scope.isBeingReviewed = true;
					resourceCache.put("/api/v1/hikes/" + $scope.hike.string_id, jQuery.extend(true, {}, $scope.hike));
					persistentStorage.set("/api/v1/hikes/" + $scope.hike.string_id, $scope.hike);
				}
				selection.clear();
				descriptionMediumEditor.hideToolbar();
				permitMediumEditor.hideToolbar();
			}).
			error(function(data, status, headers, config) {
				$scope.isSaving = false;
				$scope.isDirty = true;
				if (data.message) {
					$scope.error = "Error: " + data.message;
				} else {
					$scope.error = "Error: " + status;
				}
				$window.document.body.scrollTop = $window.document.documentElement.scrollTop = 0;
				$log.error(data, status, headers, config);
			});
	};

	$scope.done = function() {
		navigation.toEntry($scope.hike.string_id);
	};

	$scope.mapLinkClicked = function() {
		// Set last location so that map is zoomed into that spot
		persistentStorage.set("/map", {
			viewport: {
				latitude: $scope.hike.location.latitude,
				longitude: $scope.hike.location.longitude,
				zoomLevel: 12
			}
		});
	};

	$scope.$on("photoDetailsUpdated", function(event, photo) {
		$scope.isDirty = true;
		if (uploadedPhotoIdMap[photo.id]) {
			var uploadedPhoto = uploadedPhotoIdMap[photo.id];
			if (photo.attribution_link) {
				uploadedPhoto.attribution_link = photo.attribution_link;
			}
			if (photo.alt) {
				uploadedPhoto.alt = photo.alt;
			}
		}
	});

	$scope.openPhotoDetails = function(photo) {
		if (!isEditing) {
			return;
		}
		$.fancybox.open( $("#photo-details-page"), {
			closeBtn : true,
			closeEffect : "none",
			keys : true,
			padding : 2
		});
		$rootScope.$broadcast("setPhotoDetailsPhoto", photo);
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

	var doUploadPhoto = function(fileOrBlob, type, id) {
		var formData = new FormData();
		formData.append("file", fileOrBlob);
		$scope.numPhotosUploading++;
		$http({
				method: "POST",
				url: "/api/v1/hikes/" + $scope.hike.string_id + "/photos?type=" + type,
				data: formData,
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
				} else if (uploadingPhotoIdMap[id]) {
					if (uploadingPhotoIdMap[id].attribution_link) {
						data.attribution_link = uploadingPhotoIdMap[id].attribution_link;
					}
					if (uploadingPhotoIdMap[id].alt) {
						data.alt = uploadingPhotoIdMap[id].alt;
					}
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
				if (canceledUploadedPhotoIdMap[id]) {
					// Local version of the photo has already been removed, don't add it.
					// numPhotosUploading should already be updated to account for the fact that this
					// upload was essentially canceled.
					return;
				}
				$scope.numPhotosUploading--;
				$log.error(data, status, headers, config);
			});
	};

	var downsizeAndUploadPhoto = function(urlEncodedPhotoData, type, id) {
		var img = $window.document.createElement("img");
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		img.onload = function() {
			$scope.$apply(function() {
				var width = img.width;
				var height = img.height;
				if (width > height) {
					if (width > MAX_UPLOAD_PHOTO_WIDTH) {
						height *= MAX_UPLOAD_PHOTO_WIDTH / width;
						width = MAX_UPLOAD_PHOTO_WIDTH;
					}
				} else {
					if (height > MAX_UPLOAD_PHOTO_HEIGHT) {
						width *= MAX_UPLOAD_PHOTO_HEIGHT / height;
						height = MAX_UPLOAD_PHOTO_HEIGHT;
					}
				}
				canvas.width = width;
				canvas.height = height;
				context.drawImage(img, 0, 0, width, height);
				canvas.toBlob(function(blob) { doUploadPhoto(blob, type, id); }, "image/jpeg");
			});
		};
		img.src = urlEncodedPhotoData;
	};

	var processPhoto = function(file, type, id) {
		var photo = null;
		var rotation = null;
		var downsizeBeforeUpload = false;
		if (file.size > 2621440) { // 2.5 MB
			downsizeBeforeUpload = true;
		} else {
			// Upload the file as is.
			doUploadPhoto(file, type, id);
		}
		// TODO, is this the most efficient way to read both the data url and array buffer from the file?
		var dataUrlReader = new FileReader();
		dataUrlReader.onload = function (e) {
			var urlEncodedPhotoData = e.target.result;
			$scope.$apply(function() {
				photo = { id: id, src: urlEncodedPhotoData };
				uploadingPhotoIdMap[id] = photo;
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
			if (downsizeBeforeUpload) {
				downsizeAndUploadPhoto(urlEncodedPhotoData, type, id);
			}
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

	$scope.uploadPhotos = function(files, type) {
		$scope.$apply(function() {
			for (var i = 0; i < Math.min(MAX_PHOTOS_TO_UPLOAD_AT_ONCE, files.length); i++) {
				lastUploadedPhotoId++;
				processPhoto(files[i], type, lastUploadedPhotoId);
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

EntryController.$inject = ["$filter", "$http", "$log", "$rootScope", "$routeParams", "$scope", "$timeout", "$window", "analytics", "config", "dateTime", "isEditing", "navigation", "persistentStorage", "resourceCache", "selection"];