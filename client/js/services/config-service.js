"use strict";

angular.module("hikeio").
	service("config", function($location) {
		this.isProd = $location.host() === "hike.io";
		this.hikeImagesPath = this.isProd ? "http://assets.hike.io/hike-images" : "/hike-images";
		this.landingPageImagesPath = this.isProd ? "http://assets.hike.io/landing-page-images" : "/landing-page-images";
	});