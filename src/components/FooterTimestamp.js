exports.Render = async () => {
	const today = new Date();
	const year = today.getFullYear();
	$("#timestamp").text(`© 2019 - ${year}`);
};