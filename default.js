$('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(t){if(location.pathname.replace(/^\//,"")==this.pathname.replace(/^\//,"")&&location.hostname==this.hostname){var e=$(this.hash);e=e.length?e:$("[name="+this.hash.slice(1)+"]"),e.length&&(t.preventDefault(),$("html, body").animate({scrollTop:e.offset().top},1e3,function(){var t=$(e);return t.focus(),t.is(":focus")?!1:(t.attr("tabindex","-1"),void t.focus())}))}});


document.addEventListener("DOMContentLoaded", function() {
	[].slice.call(document.querySelectorAll(".btn")).forEach(function(a) {
		a.setAttribute("role", "button");
	});
});

$(function() {
	$(".magnify").magnify();
});