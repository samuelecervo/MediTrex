// FUNCTION FOR MODAL

$(document).ready(function () {
    $('.readMoreButton').click(function (event) {
        var link = $(event.target).data('link');    
        window.open(link, "_blank");

    });
});