exports.Render = async () => {
	$("#slideshow > .slideshow-item:gt(0)").hide();

	setInterval(function () {
		$("#slideshow > .slideshow-item:first")
			.fadeOut(1000)
			.next()
			.fadeIn(1000)
			.end()
			.appendTo("#slideshow");
	}, 3000);
};