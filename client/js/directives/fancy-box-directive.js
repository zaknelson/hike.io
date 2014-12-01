"use strict";

angular.module("hikeio").
	directive("fancybox", ["$http", "$log", "$rootScope", "$timeout", "resourceCache", function($http, $log, $rootScope, $timeout, resourceCache) {
		return {
			link: function (scope, element, attrs) {
				var flickrLicenses = {
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
				var context = {
					beforeLoad: function() {
						var fancyboxElement = this.element;
						var attributionLink = fancyboxElement.attr("data-attribution-link");
						if (!attributionLink) {
							return;
						} else if (attributionLink.indexOf("flickr.com") === -1) {
							$log.error("Unable to fetch attribution data for: " + attributionLink);
							return;
						}
						if (attributionLink.endsWith("/")) {
							attributionLink = attributionLink.slice(0, -1);
						}
						var splitAttributionLink = attributionLink.split("/");
						var photoId = splitAttributionLink[splitAttributionLink.length - 1];
						if (photoId) {
							$http({method: "GET", url: "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=d99915ff009f20c36657c94263e52674&photo_id=" + photoId + "&format=json&nojsoncallback=1", cache: resourceCache}).
								success(function(data, status, headers, config) {
									if (data.stat === "ok") {
										var attributionDiv = $("<div class='attribution-string'></div>");
										var authorName = data.photo.owner.realname ? data.photo.owner.realname : data.photo.owner.username;
										var title = data.photo.title._content ? data.photo.title._content : "Untitled";
										var nameAndTitleAnchor = $("<span><a href='" + fancyboxElement.attr("data-attribution-link") + "'>\"" + title + "\" by " + authorName + "</a></span>");
										var separator = $("<span class='separator'>&nbsp;&nbsp;•&nbsp;&nbsp;</span>");
										var br = $("<br>");
										var licenseName = flickrLicenses[data.photo.license].short || flickrLicenses[data.photo.license].name;
										var licenseAnchor = $("<span><a href='" + flickrLicenses[data.photo.license].url + "'>" + licenseName + "<a/></span><span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>");
										var modified = $("<span> Resized from original </span>");

										attributionDiv.append(licenseAnchor);
										attributionDiv.append(modified);
										attributionDiv.append(separator);
										attributionDiv.append(br);

										attributionDiv.append(nameAndTitleAnchor);

										$(".fancybox-inner").append(attributionDiv);
										$timeout(function() {
											attributionDiv.css("opacity", "1");
										});
									} else {
										$log.error(data);
									}
								}).
								error(function(data, status, headers, config) {
									$log.error(config);
								});
						}
					},
					beforeShow: function() {
						$(".fancybox-image").attr("alt", this.element.find("img").attr("alt"));
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