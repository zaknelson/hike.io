(function() {
	"use strict";

	var edited;

	var initEditableFields = function() {
		$("[contenteditable]").on("blur keyup paste", function(event) {
			var target = $(this);
			if (event.type === "paste") {
				var pasteData = event.originalEvent.clipboardData.getData("text/plain");
				replaceSelectedText(pasteData);
				event.preventDefault();
			}
			if (target.data("before") !== target.html()) {
				target.data("before", target.html());
				target.trigger("change");
			}
		});

		$("h1,td[contenteditable]").keypress(function(event) {
			if (event.keyCode === 13) { // return
				event.preventDefault();
				$(event.target).blur();
			} else {
				setEdited(true);
			}
		});
	};

	var initEntryNameBinding = function() {
		var entryNamedChanged = function(event) {
			if (event.target === $(".header-entry-name")[0]) {
				$(".facts-entry-name").text($(".header-entry-name").text());
			} else {
				$(".header-entry-name").text($(".facts-entry-name").text());
			}
		};

		$(".header-entry-name").change(entryNamedChanged);
		$(".facts-entry-name").change(entryNamedChanged);
	};

	var preventBackspaceFromNavigating = function() {
		$(document).bind("keydown", function(event) {
			if (event.keyCode === 8) {
				var target = event.srcElement || event.target;
				if (target === document.body) {
					event.preventDefault();
				}
			}
		});
	};

	var replaceSelectedText = function(replacementText) {
		var range = null;
		if (window.getSelection) {
			var selection = window.getSelection();
			console.log(selection)
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

	var setEdited = function(isEdited) {
		edited = isEdited;
		if (isEdited) {
			//window.onbeforeunload = function(event) {
			//	return "You have unsaved changes.";
		} else {
			window.onbeforeunload = null;
		}
	};

	$(document).ready(function() {
		if ($(".entry-page.editing").length) {
			initEditableFields();
			initEntryNameBinding();
			preventBackspaceFromNavigating();
			setEdited(false);
		}
	});
}
)();