const axios = require("axios");
const cache = require("./cached-repo.json");

exports.Render = async () => {

	const response = await axios.get("https://api.github.com/users/BrunoS3D/repos");

	let repos = response.data.filter((repo) => repo && !repo.fork);

	if (!repos) {
		console.warn("GITHUB NOT RESPONSE LOADING CACHED REPOSITORIES");
		repos = cache.filter((repo) => repo && !repo.fork);
	}

	if (repos) {
		const list = $("#repo-list");

		repos.forEach((repo) => {
			const item = $("<li>", {
				"class": "repo-list-item fade-in-bottom",
				id: "repo-item"
			});

			const content = $("<div>", {
				"class": "repo-item-content",
			});

			const title = $("<a>", {
				"class": "repo-title-name",
				href: repo.html_url,
				text: repo.name
			});

			let desc = repo.description

			if (desc.length > 132) {
				desc = desc.substr(0, 132);
				desc = desc.substr(0, Math.min(desc.length, Math.max(desc.indexOf(" "), desc.indexOf(","), desc.indexOf("."))));
				desc += "...";
			}

			const description = $("<p>", {
				"class": "repo-description",
				text: desc
			});

			if (repo.description && repo.description.length != desc.length) {
				const readmore = $("<a>", {
					"class": "repo-description-readmore",
					href: repo.html_url,
					text: "(ver mais)"
				});

				description.append(readmore);
			}

			content.append(title);
			content.append(description);

			item.append(content);

			list.append(item);
		});
	}
};
