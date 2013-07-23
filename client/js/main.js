"use strict";

angular.module("hikeio", ["seo", "ui"]).
	config(["$locationProvider", "$routeProvider", function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.
			when("/", {
				controller: "IndexController",
				templateUrl: "/partials/index.html",
				title: "hike.io"
			}).
			when("/add", {
				controller: "AddController",
				templateUrl: "/partials/add.html",
				title: "Add - hike.io"
			}).
			when("/hikes", {
				controller: "AllController",
				templateUrl: "/partials/all.html",
				title: "All Hikes - hike.io"
			}).
			when("/discover", {
				controller: "PhotoStreamController",
				templateUrl: "/partials/photo_stream.html",
				title: "Discover - hike.io"
			}).
			when("/map", {
				controller: "MapController",
				templateUrl: "/partials/map.html",
				title: "Map - hike.io"
			}).
			when("/search", {
				controller: "SearchController",
				templateUrl: "/partials/search.html",
				title: "Search - hike.io"
			}).
			when("/hikes/:hikeId", {
				controller: "EntryController",
				templateUrl: "/partials/entry.html",
				resolve: {
					isEditing: function() { return false; }
				}
			}).
			when("/hikes/:hikeId/edit", {
				controller: "EntryController",
				templateUrl: "/partials/entry.html",
				resolve: {
					isEditing: function() { return true; }
				}
			});
	}]).
	run(["$http", "$location", "$rootScope", "$templateCache", "$timeout", "config", "navigation", function($http, $location, $rootScope, $templateCache, $timeout, config, navigation) {
		$rootScope.config = config;
		$rootScope.location = $location;
		$rootScope.Modernizr = Modernizr;
		$rootScope.navigation = navigation;
		$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
			if (current && current.$$route && current.$$route.title) {
				$rootScope.title = current.$$route.title;
			}
		});

		// Pre-populate template
		$timeout(function() {
			$http.get("/partials/entry.html",			{ cache:$templateCache });
			$http.get("/partials/index.html",			{ cache:$templateCache });
			$http.get("/partials/photo_stream.html",	{ cache:$templateCache });
			$http.get("/partials/map.html",				{ cache:$templateCache });
			$http.get("/partials/search.html",			{ cache:$templateCache });
		}, 1000);
	}]);