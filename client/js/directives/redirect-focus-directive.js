"use strict";

angular.module("hikeio").
	directive("redirectFocus", function() {

	var elementComesAfter = function(a, b) {
		var comesAfter = false;
		if (a.parent()[0] === b.parent()[0]) {
			var children = a.parent().children();
			for (var i = 0; i < children.length; i++) {
				if (children[i] === b[0]) {
					comesAfter = true;
					break;
				} else if (children[i] === a[0]) {
					break;
				}
			}
		}
		return comesAfter;
	};

	// http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
	var setFocusToEnd = function(element) {
		element.focus();
		if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
			var range = document.createRange();
			range.selectNodeContents(element[0]);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.body.createTextRange !== "undefined") {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(element[0]);
			textRange.collapse(false);
			textRange.select();
		}
	};

	return {
		link: function(scope, element, attributes) {
			var dst = element.parent().find(attributes.redirectFocus);
			element.click(function(event) {
				var src = $(event.target);
				if (src[0] !== dst[0]) {
					// If the src comes after the dst in the DOM, then set the focus to the end of the input.
					if (elementComesAfter(src, dst)) {
						setFocusToEnd(dst);
					} else {
						dst.focus();
					}
				}
			});
		}
	};
});