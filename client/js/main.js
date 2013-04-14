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
  run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.location = $location;
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      if (current) {
        $rootScope.title = current.$route.title;
      }
  	});
  }]);