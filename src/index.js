const RepoList = require("./components/RepoList");
const SlideShow = require("./components/SlideShow");
const FooterTimestamp = require("./components/FooterTimestamp");

let lastSearch = "";
let searchNavCounter = 0;

// Olhe no fim deste script
async function renderComponents() {
	await RepoList.Render();
	await SlideShow.Render();
	await FooterTimestamp.Render();
}

function navbarUpdate() {
	const navbar = $("#navbar");
	const scrollPos = $(document).scrollTop();

	const scrollDynamic = $(".scroll-dynamic");
	scrollDynamic.toggleClass("scrolled", scrollPos > navbar.height());
}

$(window).on("load", function () {
	// console.log("window loaded");
	$("#load-screen").fadeOut(500);
});

$(document).ready(function () {
	// console.log("document ready");
	navbarUpdate();
});

$(".nav-link").on("click", function () {
	$(".nav-link.active").removeClass("active");
	$(this).addClass("active");
});

$("#button-scroll-top").on("click", function () {
	window.location.href = "#";
	$(".nav-link.active").removeClass("active");
	$('a[href="#"]').addClass("active");
});

$("#search-form").submit(function (event) {
	event.preventDefault();
	const search = $("#search").val();

	if (!search) return;

	if (lastSearch == search) {
		searchNavCounter++;
	}
	else {
		lastSearch = search;
		searchNavCounter = 0;
	}

	const elements = $("h1, h2, p, a, label").filter(function () {
		return $(this).text().toLowerCase().indexOf(search.toLowerCase()) >= 0;
	});

	if (searchNavCounter >= elements.length) {
		searchNavCounter = 0;
	}

	const element = elements.eq(searchNavCounter);

	if (element && element.offset()) {
		$(document).scrollTop(element.offset().top - 200);
	}
});

$("#contact-form").submit(function (event) {
	event.preventDefault();

	const fname = $("#fname").val();
	const lname = $("#lname").val();
	const subject = $("#subject").val();

	const URI = `mailto:bruno3dcontato@gmail.com?subject=Portfolio%20Contato:%20${encodeURIComponent(fname)}%20${encodeURIComponent(lname)}&body=${encodeURIComponent(subject)}`;

	window.open(URI, "_blank");
});

$(document).scroll(function () {
	const scrollPos = $(document).scrollTop();
	navbarUpdate();

	if (scrollPos > 400) {
		$("#button-scroll-top").css("display", "block");
	}
	else {
		$("#button-scroll-top").css("display", "none");
	}
});

renderComponents();