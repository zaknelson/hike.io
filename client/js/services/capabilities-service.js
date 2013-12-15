"use strict";

angular.module("hikeio").
	service("capabilities", ["$window", function($window) {
		/* global UAParser: true */
		var userAgent = new UAParser().getResult();

		this.isMobile = $($window).width() < 650;

		//http://stackoverflow.com/questions/7843150/detect-if-browser-supports-contenteditable
		this.isEditPageSupported = true;
		if ((userAgent.browser.name === "IE" && parseFloat(userAgent.browser.version) < 9) ||
			(userAgent.os.name === "Android" && parseFloat(userAgent.os.version) <= 2.3) ||
			(userAgent.os.name === "iOS" && parseFloat(userAgent.os.version) < 5) ||
			(!("contentEditable" in $window.document.documentElement))) {
			this.isEditPageSupported = false;
		}

		// Firefox validates the whole form as soon as its modified.
		// https://groups.google.com/forum/#!topic/angular/LJvPlyhpWVA
		this.isPrepopulatingFormsSupported = userAgent.browser.name !== "Firefox";

		this.contentEditableSupportsInput = userAgent.browser.name !== "IE";


		var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
		this.hidpiSupported = (window.devicePixelRatio > 1) || (window.matchMedia && window.matchMedia(mediaQuery).matches)
	}]);