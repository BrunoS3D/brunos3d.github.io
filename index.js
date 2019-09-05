window.onscroll = function () { scrollFunction() };

$(".nav-link").on("click", function () {
	$(".nav-link.active").removeClass("active");
	$(this).addClass("active");
	console.log(this);
});

function searchHandler(event) {
	event.preventDefault();
	const search = $("#search").val();
	// window.location.href = `#${search}`;
	console.log($(`*:contains("${search}"):eq(0):last`));
	$("window").scrollTop($(`*:contains("${search}"):eq(0):last`).offset().top);
}

function scrollFunction() {
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
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
	window.location.href = "#";
	$(".nav-link.active").removeClass("active");
	$('a[href="#"]').addClass("active");
	// document.body.scrollTop = 0; // For Safari
	// document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}