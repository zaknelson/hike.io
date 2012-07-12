(function() {

	var fetchPreview = function(path) {
		console.log("fetching preview " + path);
		var image = new Image();

		image.onload = function(event) {
			var preview = $("<a>").append($("<div>")).addClass('preview').append(image)
			$("#preview-list").append(preview)
		};
		image.src = path;
	};

	$(window).load(function() {
		// TODO fetch delayed previews
	});
}
)();