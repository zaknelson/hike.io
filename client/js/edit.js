(function() {
	"use strict";

	var state = {
		edited: false
	};
	var savedSinceLastEdit;

	var initEditableFields = function() {
		$("[contenteditable]").on("blur keyup cut copy", function(event) {
			$(event.target).trigger("change");
		});

		$("[contenteditable]").on("paste", function(event) {
			var target = $(event.target);
			var pastedData = null;
			if (event.originalEvent.clipboardData) {
				document.execCommand("insertText", false, event.originalEvent.clipboardData.getData("text/plain"));
				event.preventDefault();
				target.trigger("change");
			} else {
				event.preventDefault();
			}
		});

		$(".single-line[contenteditable]").keypress(function(event) {
			if (event.keyCode === 13) { // return
				event.preventDefault();
				$(event.target).blur();
			}
		});

		$("[contenteditable]").on("input", function() {
			state.edited = true;
		});
	};

	var initHikeNameBinding = function() {
		var hikeNamedChanged = function(event) {
			if (event.target === $(".header-hike-name")[0]) {
				$(".facts-hike-name").text($(".header-hike-name").text());
			} else {
				$(".header-hike-name").text($(".facts-hike-name").text());
			}
		};

		$(".header-hike-name").change(hikeNamedChanged);
		$(".facts-hike-name").change(hikeNamedChanged);
	};

	var initSaveButton = function() {
		$(".save-button").click(function() {
			/*jshint camelcase:false */

			var utils = new window.hikeio.ContentEditableUtils();

			var hikeJson = {};
			hikeJson.string_id = window.location.pathname.split(/\//)[1];
			hikeJson.name = $(".header-hike-name").text();
			hikeJson.description = utils.getTextFromContentEditable($(".overview-description"));

			//hikeJson.elevation_gain
			$(".save-button").button("loading");
			$.ajax({
				url: "/api/v1/hikes/" + hikeJson.string_id,
				type: "PUT",
				data: JSON.stringify(hikeJson),
				dataType: "json",
				success: function() {
					state.edited = false;
					$(".save-button").text("Saved");
					$(".save-button").attr("disabled");
				},
				error: function(jqXhr, textStatus, errorThrown) {
					log(jqXhr, textStatus, errorThrown);
				}
			});
		});
	};

	var initDoneButton = function() {
		$(".done-button").click(function() {
			window.location.href = window.location.href.replace(/\/edit/, "");
		});
	};

	var initFocus = function() {
		if ($(".overview-description").text().trim() === "") {
			$(".overview-description").focus();
		}
	};

	var initGlobalKeyBindings = function() {
		$(document).keydown(function(event) {
			if (event.keyCode === 8) { // delete

				// Disable delete from accidentally navigating away from the page
				var target = event.srcElement || event.target;
				if (target === document.body) {
					event.preventDefault();
				}
			}
		});
	};

	var initEditWatch = function() {
		watch(state, "edited", function() {
			if (state.edited) {
				$(".save-button").button("reset");

				// Disable annoying alert for development
				if (window.location.hostname !== "localhost") {
					window.onbeforeunload = function() {
						return "You have unsaved changes.";
					};
				}
			} else {
				$(".save-button").attr("disabled");
				window.onbeforeunload = null;
			}
		});
	};

	var setSavedSinceLastEdit = function(isSavedSinceLastEdit) {
		savedSinceLastEdit = isSavedSinceLastEdit;
	};

	$(document).ready(function() {
		if ($(".hike-page.editing").length) {
			initEditableFields();
			initHikeNameBinding();
			initSaveButton();
			initDoneButton();
			initFocus();
			initGlobalKeyBindings();
			initEditWatch();
			setSavedSinceLastEdit(true);
		}
	});
}
)();