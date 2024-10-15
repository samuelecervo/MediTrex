// TRANSITION BETWEEN PAGES
$(document).ready(function () {
    $('body').css('overflow', 'hidden');
    var preloader = $('#overlay');
	setTimeout(() => {
        preloader.css({
            'opacity': 0,
            'transition': 'opacity 0.2s ease'
        });
    }, 800);
    setTimeout(() => {
        preloader.css('display', 'none');
        $('body').css('overflow', 'auto');
    }, 1000);
});