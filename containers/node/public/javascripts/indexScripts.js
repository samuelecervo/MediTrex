// FUNCTION FOR MODAL

$(document).ready(function () {
    $('#articlePage').on('load', function () {
        $('#articleModal').modal('show');
    }).on('error', function () {
        $('#articleModal').modal('show');
    });

    $('.readMoreButton').click(function (event) {
        $('#articlePage').attr('src', $(event.target).data('link'));
    });
});