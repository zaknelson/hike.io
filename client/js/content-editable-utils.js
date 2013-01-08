(function() {
	"use strict";
	
	var ContentEditableUtils = function() {
	};
	
	ContentEditableUtils.prototype.replaceSelectedText = function(replacementText) {
		var range = null;
		if (window.getSelection) {
			var selection = window.getSelection();
			if (selection.rangeCount) {
				range = selection.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(replacementText));
				selection.addRange(range);
				selection.collapseToEnd();
			}
		} else if (document.selection && document.selection.createRange) {
			range = document.selection.createRange();
			range.text = replacementText;
		}
	};

	ContentEditableUtils.prototype.getTextFromContentEditable = function(contentEditable) {
		var pre = $("<pre/>").html(contentEditable.html());
		if ($.browser.webkit) {
			pre.find("div").replaceWith(function() { return "\n" + this.innerHTML; });
		} else if ($.browser.msie)
			pre.find("p").replaceWith(function() { return this.innerHTML + "<br>"; });
		else if ($.browser.mozilla || $.browser.opera || $.browser.msie) {
			pre.find("br").replaceWith("\n");
		}
		return pre.text();
	};

	// Export
	window.io.hike.ContentEditableUtils = ContentEditableUtils;
}
)();