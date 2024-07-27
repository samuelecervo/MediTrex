// TRANSITION BETWEEN PAGES

$(document).ready(function () {
    var preloader = $('#overlay');
	setTimeout(() => {
        preloader.css({
            'opacity': 0,
            'transition': 'opacity 0.2s ease'
        });
    }, 800);
    setTimeout(() => {
        preloader.css('display', 'none');
    }, 1000);
});