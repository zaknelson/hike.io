"use strict";

angular.module("hikeio", ["ui"]).
  config(["$locationProvider", "$routeProvider", function($locationProvider, $routeProvider) {
  	$locationProvider.html5Mode(true);
    $routeProvider.
      when("/", {
        controller: IndexController,
        templateUrl: "/partials/index.html",
        title: "hike.io" }).
      when("/discover", {
        controller: PhotoStreamController,
        templateUrl: "/partials/photo_stream.html",
        title: "Discover - hike.io" }).
      when("/map", {
        controller: MapController,
        templateUrl: "/partials/map.html",
        title: "Map - hike.io" }).
      when("/hikes/:hikeId", {
        controller: EntryController,
        templateUrl: "/partials/entry.html"}).
      when("/hikes/:hikeId/edit", {
        controller: EntryController,
        templateUrl: "/partials/entry.html"});
  }]).
  run(["$rootScope", "$location", "config", "navigation", function($rootScope, $location, config, navigation) {
    $rootScope.config = config;
    $rootScope.location = $location;
    $rootScope.Modernizr = Modernizr;
    $rootScope.navigation = navigation;
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      if (current && current.$route.title) {
        $rootScope.title = current.$route.title;
      }
  	});
  }]);