$(document).ready(function () {

    setMedicalRecord();

    $('input[name="smokeFrequency"]').change(function () {
        var newValue = $('input[name="smokeFrequency"]:checked').val();
        changeFrequency('smoke', newValue)
    });

    $('input[name="drugFrequency"]').change(function () {
        var newValue = $('input[name="drugFrequency"]:checked').val();
        changeFrequency('drugs', newValue)
    });

    $('input[name="alcoholFrequency"]').change(function () {
        var newValue = $('input[name="alcoholFrequency"]:checked').val();
        changeFrequency('alcohol', newValue)
    });

    $('#saveButton').click(function () {
        var newMH = $("#mrMH").val();
        var newCS = $("#mrCS").val();
        var newALL = $("#mrALL").val();
        var currentDate = new Date().toISOString().slice(0, 10);
        var newSmoke = $('input[name="smokeFrequency"]:checked').val();
        var newDrugs = $('input[name="drugFrequency"]:checked').val();
        var newAlcohol = $('input[name="alcoholFrequency"]:checked').val();

        fetch('/api/changeMR?newMH='+newMH+'&newALL='+newALL+'&newSmoke='+newSmoke+'&newDrugs='+newDrugs+'&newAlcohol='+newAlcohol+'&newCS='+newCS+'&currentDate='+currentDate)
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });


    $(window).on('resize', function () {
        $('.check-group').each(function () {
            var $this = $(this);
            if ($this.width() < 120) {
                $('.label0').text('0');
                $('.label1').text('1');
                $('.label2').text('2');
                $('.label3').text('3');

            } else {
                $('.label0').text('Never');
                $('.label1').text('Occasionally');
                $('.label2').text('≤ 3 times a day');
                $('.label3').text('> 3 times a day');
            }
        });
    });

});

function setMedicalRecord() {
    fetch('/api/getMedicalRecord')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            data.forEach(function (mrData) {
                $('#mrName').text(mrData.name + ' ' + mrData.surname);
                $('#mrGender').text(mrData.gender);
                if (mrData.doctorname == null) {
                    $('#mrGP').text("You haven't requested a GP yet.");
                } else {
                    $('#mrGP').text("Dr. " + mrData.doctorname + " " + mrData.doctorsurname);
                }
                $('#mrEmail').text(mrData.email);

                $("#smoke" + mrData.smoke).prop("checked", true);
                $("#drugs" + mrData.drugs).prop("checked", true);
                $("#alcohol" + mrData.alcohol).prop("checked", true);

                $('#mrMH').text(mrData.medicalhistory);
                $("#mrCS").text(mrData.symptoms);
                $('#mrALL').text(mrData.allergies);

            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}