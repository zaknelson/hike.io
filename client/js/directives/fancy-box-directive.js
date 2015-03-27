"use strict";

angular.module("hikeio").
	directive("fancybox", ["$log", "$rootScope", "$timeout", "attribution", function($log, $rootScope, $timeout, attribution) {
		return {
			link: function (scope, element, attrs) {

				var context = {
					beforeLoad: function() {
						var fancyboxElement = this.element;
						var attributionLink = fancyboxElement.attr("data-attribution-link");
						var altText = fancyboxElement.find("img").attr("alt");
						if (attributionLink) {
							attribution.getAttribution(attributionLink).
								then(function(attributionObject) {
									var attributionDiv = $("<div class='photo-metadata-string'></div>");
									var title = $("<span><a href='" + fancyboxElement.attr("data-attribution-link") + "'>\"" + attributionObject.title + "\"</a>");
									var name = $("<span>&nbsp;by " + attributionObject.author + "</span>");
									var separator = $("<span class='separator'>&nbsp;&nbsp;•&nbsp;&nbsp;</span>");
									var br = $("<br>");
									var licenseAnchor = $("<span><a href='" + attributionObject.licenseUrl + "'>" + attributionObject.license + "<a/></span><span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>");
									var modified = $("<span> Resized from original </span>");

									attributionDiv.append(licenseAnchor);
									attributionDiv.append(modified);
									attributionDiv.append(separator);
									attributionDiv.append(br);
									attributionDiv.append(name);
									attributionDiv.append(title);

									$(".fancybox-inner").append(attributionDiv);
									$timeout(function() {
										attributionDiv.css("opacity", "1");
									});
								}, function(err) {
									$log.error(err);
								});
						} else if (altText) {
							$timeout(function() {
								var attributionDiv = $("<div class='photo-metadata-string'></div>");
								attributionDiv.append($("<span>" + altText + "</span>"));
								$(".fancybox-inner").append(attributionDiv);
								attributionDiv.css("opacity", "1");
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