const RepoList = require("./components/RepoList");

async function renderComponents() {
	await RepoList.Render();
}

renderComponents();

window.onscroll = () => {
	const scrollPos = $(document).scrollTop();

	if (scrollPos > 400) {
		$("#navbar").css("top", `${-(scrollPos - 450)}px`);

		// display back to top button
		$("#button-scroll-top").css("display", "block");
	} else {
		$("#navbar").css("top", "50px");

		// hide back to top button
		$("#button-scroll-top").css("display", "none");
	}
};

$(".nav-link").on("click", () => {
	$(".nav-link.active").removeClass("active");
	$(this).addClass("active");
	console.log(this);
});

$("#button-scroll-top").on("click", () => {
	window.location.href = "#";
	$(".nav-link.active").removeClass("active");
	$('a[href="#"]').addClass("active");
});

// function searchHandler(event) {
// 	event.preventDefault();
// 	const search = $("#search").val();
// 	// window.location.href = `#${search}`;
// 	console.log($(`*:contains("${search}"):eq(0):last`));
// 	$("window").scrollTop($(`*:contains("${search}"):eq(0):last`).offset().top);
// }