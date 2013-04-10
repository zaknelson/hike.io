"use strict";

angular.module("hikeio", ["ui"]).
  config(["$locationProvider", "$routeProvider", function($locationProvider, $routeProvider) {
  	$locationProvider.html5Mode(true);
    $routeProvider.
      when("/", {
        controller: IndexController,
        templateUrl: "/?partial=true",
        title: "hike.io" }).
      when("/discover", {
        controller: PhotoStreamController,
        templateUrl: "/discover?partial=true",
        title: "Discover - hike.io" }).
      when("/map", {
        controller: MapController,
        templateUrl: "/map?partial=true",
        title: "Map - hike.io" });
  }]).

  // Handle title change
  run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      if (current) {
        $rootScope.title = current.$route.title;
      }
  	});
  }]);