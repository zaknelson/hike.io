"use strict";

angular.module("hikeio").
	service("attribution", ["$http", "$q", "resourceCache", function($http, $q, resourceCache) {

		var DEFAULT_ATTRIBUTION_TITLE = "Untitled";
		var FLICKR_LICENSES = {
			"0": {"name":"All Rights Reserved", "url":"" },
			"1": {"name":"Attribution-NonCommercial-ShareAlike License", "short":"CC BY-NC-SA 2.0", "url":"http://creativecommons.org/licenses/by-nc-sa/2.0/"},
			"2": {"name":"Attribution-NonCommercial License", "short":"CC BY-NC 2.0", "url":"http://creativecommons.org/licenses/by-nc/2.0/"},
			"3": {"name":"Attribution-NonCommercial-NoDerivs License", "short":"CC BY-NC-ND 2.0", "url":"http://creativecommons.org/licenses/by-nc-nd/2.0/"},
			"4": {"name":"Attribution License", "short":"CC BY 2.0", "url":"http://creativecommons.org/licenses/by/2.0/"},
			"5": {"name":"Attribution-ShareAlike License", "short":"CC BY-SA 2.0", "url":"http://creativecommons.org/licenses/by-sa/2.0/"},
			"6": {"name":"Attribution-NoDerivs License", "short":"CC BY-ND 2.0", "url":"http://creativecommons.org/licenses/by-nd/2.0/"},
			"7": {"name":"No known copyright restrictions", "url":"http://www.flickr.com/commons/usage/"},
			"8": {"name":"United States Government Work", "url":"http://www.usa.gov/copyright.shtml"}
		};

		var AttributionService = function() {
		};

		var getFlickrAttribution = function(deferred, link) {
			if (link.endsWith("/")) {
				link = link.slice(0, -1);
			}
			var splitLink = link.split("/");
			var photoId = splitLink[splitLink.length - 1];
			if (photoId) {
				$http({method: "GET", url: "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=d99915ff009f20c36657c94263e52674&photo_id=" + photoId + "&format=json&nojsoncallback=1", cache: resourceCache}).
					success(function(data, status, headers, config) {
						if (data.stat === "ok") {
							deferred.resolve({
								author: data.photo.owner.realname ? data.photo.owner.realname : data.photo.owner.username,
								title: data.photo.title._content ? data.photo.title._content : DEFAULT_ATTRIBUTION_TITLE,
								license: FLICKR_LICENSES[data.photo.license].short || FLICKR_LICENSES[data.photo.license].name,
								licenseUrl: FLICKR_LICENSES[data.photo.license].url
							});
						} else {
							deferred.reject(data);
						}
					}).
					error(function(data, status, headers, config) {
						deferred.reject(config);
					});
			}
		};

		var getWikipediaAttribution = function(deferred, link) {
			var splitLink = link.split("File:");
			var photoId = splitLink[splitLink.length - 1];
			if (photoId) {
				$http({method: "JSONP", url: "http://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=File:" + photoId + "&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|ObjectName&callback=JSON_CALLBACK", cache: resourceCache}).
					success(function(data, status, headers, config) {
						if (data.query &&
							data.query.pages &&
							data.query.pages["-1"] &&
							data.query.pages["-1"].imageinfo &&
							data.query.pages["-1"].imageinfo[0] &&
							data.query.pages["-1"].imageinfo[0].extmetadata) {
							deferred.resolve({
								author: data.query.pages["-1"].imageinfo[0].extmetadata.Artist.value,
								title: data.query.pages["-1"].imageinfo[0].extmetadata.ObjectName.value,
								license: data.query.pages["-1"].imageinfo[0].extmetadata.LicenseShortName.value,
								licenseUrl: data.query.pages["-1"].imageinfo[0].extmetadata.LicenseUrl.value,
							});
						} else {
							deferred.reject(data);
						}
					}).
					error(function(data, status, headers, config) {
						deferred.reject(config);
					});
			}
		};

		AttributionService.prototype.getAttribution = function(link) {
			var deferred = $q.defer();
			if (link.indexOf("flickr.com") !== -1) {
				getFlickrAttribution(deferred, link);
			} else if (link.indexOf("wikipedia.org") !== -1) {
				getWikipediaAttribution(deferred, link);
			} else {
				deferred.reject("Unable to fetch attribution data for: " + link);
			}
			return deferred.promise;
		};

		return new AttributionService();
	}]);