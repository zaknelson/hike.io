"use strict";

angular.module("hikeio").
	directive("fancybox", ["$http", "$log", "$rootScope", "resourceCache", function($http, $log, $rootScope, resourceCache) {
		return {
			link: function (scope, element, attrs) {

				var flickrLicenses = {
					"0": {"name":"All Rights Reserved", "url":"" }, 
					"1": {"name":"Attribution-NonCommercial-ShareAlike License", "url":"http:\/\/creativecommons.org\/licenses\/by-nc-sa\/2.0\/"},
					"2": {"name":"Attribution-NonCommercial License", "url":"http:\/\/creativecommons.org\/licenses\/by-nc\/2.0\/"},
					"3": {"name":"Attribution-NonCommercial-NoDerivs License", "url":"http:\/\/creativecommons.org\/licenses\/by-nc-nd\/2.0\/"},
					"4": {"name":"Attribution License", "url":"http:\/\/creativecommons.org\/licenses\/by\/2.0\/"},
					"5": {"name":"Attribution-ShareAlike License", "url":"http:\/\/creativecommons.org\/licenses\/by-sa\/2.0\/"},
					"6": {"name":"Attribution-NoDerivs License", "url":"http:\/\/creativecommons.org\/licenses\/by-nd\/2.0\/"},
					"7": {"name":"No known copyright restrictions", "url":"http:\/\/www.flickr.com\/commons\/usage\/"},
					"8": {"name":"United States Government Work", "url":"http:\/\/www.usa.gov\/copyright.shtml"}
				}
				var context = {
					beforeLoad: function() {
						var fancyboxElement = this.element;
						var attributionLink = fancyboxElement.attr("data-attribution-link");
						if (attributionLink.indexOf("flickr.com") === -1) {
							$log.error("Unable to fetch attribution data for: " + attributionLink);
							return;
						}
						if (attributionLink.endsWith("/")) {
							attributionLink = attributionLink.slice(0, -1);
						}
						var splitAttributionLink = attributionLink.split("/");
						var photoId = splitAttributionLink[splitAttributionLink.length - 1];
						if (photoId) {
							$http({method: "GET", url: "http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=aa2e2ebcba459cba129a21149ac392fc&photo_id=" + photoId + "&format=json&nojsoncallback=1", cache: resourceCache}).
								success(function(data, status, headers, config) {
									if (data.stat === "ok") {
										var attributionDiv = $("<div class='attribution-string'></div>");
										var nameAndTitleAnchor = $("<a href='" + fancyboxElement.attr("data-attribution-link") + "'>\"" + data.photo.title._content + "\" by " + data.photo.owner.realname + "<a/>");
										var separator = $("<span class='separator'> - </span>");
										var br = $("<br>");
										var licenseAnchor = $("<a href='" + flickrLicenses[data.photo.license].url + "'>" + flickrLicenses[data.photo.license].name + "<a/>");
										var modified = $("<span> - Resized from original </span>");
										attributionDiv.append(nameAndTitleAnchor);
										attributionDiv.append(br);
										attributionDiv.append(separator);
										attributionDiv.append(licenseAnchor);
										attributionDiv.append(modified);
										$(".fancybox-inner").append(attributionDiv);
									}
								}).
								error(function(data, status, headers, config) {
									$log.error(config);
								});
						}
					},
					afterLoad: function() {
						$rootScope.$broadcast("fancyboxLoaded");
						var attributionLink = this.element.attr("data-attribution-link");
						if (attributionLink) {
							var anchor = $(".attribution-link").clone();
							anchor.attr("href", attributionLink);
							anchor.addClass("active");
							anchor.click(function(event) {
								event.stopPropagation();
							});
							$(".fancybox-inner").append(anchor);
						}
					},
					afterClose: function() {
						$rootScope.$broadcast("fancyboxClosed");
					},
					margin: 30,
					padding : 2,
					nextEffect : "none",
					prevEffect : "none",
					closeEffect : "none",
					closeBtn : true,
					arrows : false,
					keys : true,
					nextClick : true
				};

				scope.$on("$routeChangeStart", function () {
					$.fancybox.close();
				});
				scope.$on("fancyboxClose", function () {
					$.fancybox.close();
				});
				scope.$on("$destroy", function () {
					context.afterLoad = null;
					context.afterClose = null;
				});

				$(element).find(attrs.fancybox).fancybox(context);
			}
		};
	}]);