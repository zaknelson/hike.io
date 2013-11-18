"use strict";

angular.module("hikeio").
	directive("fancybox", ["$rootScope", function($rootScope) {
		return {
			link: function (scope, element, attrs) {
				var context = {
					afterLoad: function(current, previous) {
						$rootScope.$broadcast("fancyboxLoaded");
					},
					afterClose: function(current, previous) {
						$rootScope.$broadcast("fancyboxClosed");
					},
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