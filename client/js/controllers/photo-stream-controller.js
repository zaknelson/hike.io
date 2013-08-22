"use strict";
var PhotoStreamController = function($scope, $http, $log, $timeout, analytics, progressbar, resourceCache) {

	progressbar.start();
	$http({method: "GET", url: "/api/v1/hikes?fields=distance,locality,name,photo_preview,string_id", cache: resourceCache}).
		success(function(data, status, headers, config) {
			// Only show the hikes that have photo previews
			var hikes = jQuery.grep(data, function(hike){
				return hike.photo_preview;
			});
			$scope.hikes = hikes;
			$timeout(function() {
				var loaded = 0;
				$(".preview-img").load(function() {
					loaded++;
					progressbar.set(100.0 / hikes.length)
					if (loaded === hikes.length) {
						progressbar.complete();
					}
				});
			})
			
		}).
		error(function(data, status, headers, config) {
			$log.error(config);
			progressbar.complete();
		});

	$scope.hikes = [];
	$scope.htmlReady();
};

PhotoStreamController.$inject = ["$scope", "$http", "$log", "$timeout", "analytics", "progressbar", "resourceCache"];