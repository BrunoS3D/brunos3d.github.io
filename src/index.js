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

$(document).scroll(function () {
	const navbar = $("#navbar");
	const scrollPos = $(document).scrollTop();

	const scrollDynamic = $(".scroll-dynamic");
	scrollDynamic.toggleClass("scrolled", scrollPos > navbar.height());

	if (scrollPos > 400) {
		// navbar.css("top", `${-(scrollPos - 400)}px`);

		// display back to top button
		$("#button-scroll-top").css("display", "block");
	} else {
		// navbar.css("top", "0");

		// hide back to top button
		$("#button-scroll-top").css("display", "none");
	}
});

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