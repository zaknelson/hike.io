(function() {
	"use strict";
	
	var ContentEditableUtils = function() {
	};

	ContentEditableUtils.prototype.getTextFromContentEditable = function(contentEditable) {
		var pre = $("<pre/>").html(contentEditable.html());
		pre.find("div").replaceWith(function() { return "\n" + this.innerHTML; });
		pre.find("p").replaceWith(function() { return this.innerHTML + "<br>"; });
		pre.find("br").replaceWith("\n");
		var tempParagraphs = pre.text().trim().split("\n");
		var resultParagraphs = [];
		$.each(tempParagraphs, function(index, value) {
			value = value.trim();
			if (value !== "") {
				resultParagraphs.push("<p>" + value + "</p>");
			}
		});
		return resultParagraphs.join("");
	};

	// Export
	window.hikeio.ContentEditableUtils = ContentEditableUtils;
}
)();