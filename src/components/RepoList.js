const axios = require("axios");
const cache = require("./cached-repo.json");

exports.Render = async () => {

	const response = await axios.get("https://api.github.com/users/BrunoS3D/repos");

	const repos = response.data.filter((repo) => repo && !repo.fork);
	// const repos = cache.filter((repo) => repo && !repo.fork);

	if (repos) {
		const list = $("#repo-list");

		repos.forEach((repo) => {
			const item = $("<li>", {
				"class": "repo-list-item",
			});

			const content = $("<div>", {
				"class": "repo-item-content",
			});

			const title = $("<a>", {
				"class": "repo-title-name",
				href: repo.html_url,
				text: repo.name
			});

			const description = $("<p>", {
				"class": "repo-description",
				text: repo.description
			});

			content.append(title);
			content.append(description);

			item.append(content);

			list.append(item);
		});
	}
};
