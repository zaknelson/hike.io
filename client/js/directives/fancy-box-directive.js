"use strict";

angular.module("hikeio").
	directive("fancybox", function($timeout) {
		return {
			link: function (scope, element, attrs) {
				scope.$on("$routeChangeStart", function () {
					$.fancybox.close();
				});
				$(element).find(attrs.fancybox).fancybox({
					padding: 10,
					nextEffect : "none",
					prevEffect : "none",
					closeEffect : "none",
					closeBtn : true,
					arrows : false,
					keys : true,
					nextClick : true
				});
			}
		};
	});