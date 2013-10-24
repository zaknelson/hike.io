"use strict";

angular.module("hikeio").
	service("capabilities", ["$window", function($window) {
		// http://stackoverflow.com/questions/8348139/detect-ios-version-less-than-5-with-javascript
		var getIOSVersion = function () {
			if (/iP(hone|od|ad)/.test($window.navigator.platform)) {
				var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
				return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
			}
		};

		// http://stackoverflow.com/questions/7184573/pick-up-the-android-version-in-the-browser-by-javascript
		var getAndroidVersion = function() {
			var ua = navigator.userAgent;
			if(ua.indexOf("Android") >= 0 ) {
				return parseFloat(ua.slice(ua.indexOf("Android")+8));
			}
		};

		//http://stackoverflow.com/questions/7843150/detect-if-browser-supports-contenteditable
		this.isEditPageSupported = true;
		var androidVersion = getAndroidVersion();
		var iOSVersion = getIOSVersion();
		if ((androidVersion && androidVersion <= 2.3) || (iOSVersion && iOSVersion[0] < 5) || !("contentEditable" in $window.document.documentElement)) {
			this.isEditPageSupported = false;
		}
	}]);