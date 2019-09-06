const RepoList = require("./components/RepoList");

$(".nav-link").on("click", function () {
	$(".nav-link.active").removeClass("active");
	$(this).addClass("active");
});

$("#button-scroll-top").on("click", function () {
	window.location.href = "#";
	$(".nav-link.active").removeClass("active");
	$('a[href="#"]').addClass("active");
});

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

async function renderComponents() {
	await RepoList.Render();
}

renderComponents();

// function searchHandler(event) {
// 	event.preventDefault();
// 	const search = $("#search").val();
// 	// window.location.href = `#${search}`;
// 	console.log($(`*:contains("${search}"):eq(0):last`));
// 	$("window").scrollTop($(`*:contains("${search}"):eq(0):last`).offset().top);
// }