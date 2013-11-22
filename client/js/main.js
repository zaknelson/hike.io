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
	run(["$http", "$location", "$rootScope", "$templateCache", "$timeout", "$window", "capabilities", "config", "navigation", function($http, $location, $rootScope, $templateCache, $timeout, $window, capabilities, config, navigation) {
		// HACK, if url parameters include _escaped_fragment_ this request is being made by a crawler and the html is already rendered.
		// If angular starts to render again, things won't look right, so throw an exception to essentially disable angular
		if ($location.search()["_escaped_fragment_"] !== undefined) {
			throw Error();
		}
		$rootScope.config = config;
		$rootScope.capabilities = capabilities;
		$rootScope.location = $location;
		$rootScope.Modernizr = Modernizr;
		$rootScope.navigation = navigation;
		$rootScope.isMobile = $($window).width() < 650;
		$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
			if (current && current.$$route && current.$$route.title) {
				$rootScope.title = current.$$route.title;
			}
		});
		$rootScope.$on("$locationChangeStart", function(event, next, current) {
			var isOnEntryEditPage = /\/hikes\/.*?\/edit/.test(next);
			if (isOnEntryEditPage && !capabilities.isEditPageSupported) {
				$window.alert("Sorry this browser doesn't support editing.");
				event.preventDefault();
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

		// IE 9 does its own caching, and requests are not hitting the server
		jQuery.ajaxSetup({ cache: false });
	}]);