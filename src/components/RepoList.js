const axios = require("axios");
const cache = require("./cached-repo.json");

exports.Render = async () => {

	let repos = cache;

	try {
		const response = await axios.get("https://api.github.com/users/BrunoS3D/repos");

		if (response && response.data) {
			repos = response.data;
		}
		else {
			console.warn("GITHUB NOT RESPONSE LOADING CACHED REPOSITORIES");
		}
	}
	catch {
		console.warn("GITHUB NOT RESPONSE LOADING CACHED REPOSITORIES");
	}

	if (repos) {
		repos = repos.filter((repo) => repo && !repo.fork);

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
				if (desc.length <= 100) {
					desc = desc.substr(0, 132);
				}
				desc += "...";
			}

			const description = $("<p>", {
				"class": "repo-description",
				text: desc
			});

			const github_buttons = $("<div>", {
				"class": "github_buttons",
			});

			/*
			<!-- Place this tag where you want the button to render. -->
			<a class="github-button" href="https://github.com/BrunoS3D/Doom-Fire/subscription" data-icon="octicon-eye" aria-label="Watch BrunoS3D/Doom-Fire on GitHub">Watch</a>
			*/

			const watch_button = $("<a>", {
				"class": "github-button",
				href: `https://github.com/BrunoS3D/${repo.name}/subscription`,
				"data-icon": "octicon-eye",
				"data-size": "large",
				"aria-label": `Watch BrunoS3D/${repo.name} on GitHub`,
				text: "Watch"
			});

			/*
			<!-- Place this tag where you want the button to render. -->
			<a class="github-button" href="https://github.com/BrunoS3D/Bla-bla-bot" data-icon="octicon-star" data-size="large" aria-label="Star BrunoS3D/Bla-bla-bot on GitHub">Star</a>
			*/

			const star_button = $("<a>", {
				"class": "github-button",
				href: `https://github.com/BrunoS3D/${repo.name}`,
				"data-icon": "octicon-star",
				"data-size": "large",
				"aria-label": `Star BrunoS3D/${repo.name} on GitHub`,
				text: "Star"
			});

			/*
			<!-- Place this tag where you want the button to render. -->
			<a class="github-button" href="https://github.com/BrunoS3D/Doom-Fire/fork" data-icon="octicon-repo-forked" aria-label="Fork BrunoS3D/Doom-Fire on GitHub">Fork</a>
			*/

			const fork_button = $("<a>", {
				"class": "github-button",
				href: `https://github.com/BrunoS3D/${repo.name}/fork`,
				"data-icon": "octicon-repo-forked",
				"data-size": "large",
				"aria-label": `Fork BrunoS3D/${repo.name} on GitHub`,
				text: "Fork"
			});

			if (repo.description && repo.description.length != desc.length) {
				const readmore = $("<a>", {
					"class": "repo-description-readmore",
					href: repo.html_url,
					text: "(ver mais)"
				});

				description.append(readmore);
			}

			github_buttons.append(watch_button);
			github_buttons.append(fork_button);
			github_buttons.append(star_button);

			content.append(title);
			content.append(description);

			item.append(content);
			item.append(github_buttons);

			list.append(item);
		});
	}
};
