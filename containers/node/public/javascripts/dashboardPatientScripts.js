$(document).ready(function () {
    $('#datePicker').val(new Date().toDateInputValue());
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    var date = new Date();
    $('#showMonthYear').text(months[date.getMonth()] + ' ' + date.getFullYear());

    setCalendar(date);
    setMedicationsList($('#datePicker').val())

    $('#leftArrow').click(function() {
        date = new Date(date.setMonth(date.getMonth()-1));
        $('#showMonthYear').text(months[date.getMonth()] + ' ' + date.getFullYear());
        setCalendar(date);
    });

    $('#rightArrow').click(function() {
        date = new Date(date.setMonth(date.getMonth()+1));
        $('#showMonthYear').text(months[date.getMonth()] + ' ' + date.getFullYear());
        setCalendar(date);
    });

    $("#datePicker").change(function () {
        setMedicationsList($(this).val());
    });

    $("#symptompsTextarea").change(function () {
        var newText = $(this).val();
        var currentDate = $("#datePicker").val();
        fetch('/api/changeSymptoms?newText='+newText+'&currentDate='+currentDate)
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

    $(window).on('resize', function() {
        $('.day-header').each(function() {
            var $this = $(this);
            let originalText = $this.data('original-text') || $this.text();
            $this.data('original-text', originalText);
            if ($this.width() < 100) {
                $this.text(originalText.charAt(0));
            } else {
                $this.text(originalText);
            }
        });
    });
});

function setCalendar(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= firstDay.getDay(); i++) {
        var childNumber = i+7;
        $(".day-cell:nth-child("+childNumber+")").html('');
    }

    for (let i = 1; i <= daysInMonth; i++) {
        var childNumber = i + firstDay.getDay() + 7;
        $(".day-cell:nth-child("+childNumber+")").html('<div class="day day-number">'+i+'</div> <div class="day day-desc"><ul class="list-group"></ul></div>');
    }

    for (let i = 1; i <= 49 - firstDay.getDay() - daysInMonth; i++) {
        var childNumber = i + firstDay.getDay() + daysInMonth + 7;
        $(".day-cell:nth-child("+childNumber+")").html('');
    }

    fillCalendar(date);
}

function fillCalendar(date) {
    fetch('/api/getAppointments?month='+(date.getMonth()+1)+'&year='+date.getFullYear())
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        data.forEach(function(appointment) {
            var dataAppuntamento = new Date(appointment.date);
            var giornoAppuntamento = dataAppuntamento.getDate();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var cella = firstDay.getDay() + 7 + giornoAppuntamento;
            var newElem = '<li class="list-group-item">'+appointment.name.charAt(0) +'. ' + appointment.surname + ' (' + appointment.time.split(":")[0]+':'+appointment.time.split(":")[1] + ')</li>';
            $(".day-cell:nth-child("+cella+") > .day-desc > ul")
                .append(newElem);
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

async function setMedicationsList(currentDate) {
    fetch('/api/getMedicationsByPatientAndDate?currentDate='+currentDate)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then (data => {
        $('#medicationsTable tbody').html('');
        data.forEach(async function(medication) {
            var forCounter = medication.frequency;
            if (forCounter == 0) forCounter = 1;
            for (let i=1; i <= forCounter; i++) {
                if (!(medication.occurrence && medication.occurrence!=i && data.some(item => item.prescriptionid === medication.prescriptionid && item.occurrence!=medication.occurrence))) {
                    const newRow = $('<tr></tr>');
                    newCell = $('<td class="col-6"></td>').text(medication.medication);
                    newRow.append(newCell);

                    if (medication.time) {
                        var newHour = medication.time.split(":")[0]*1;
                        if (forCounter > 1) {
                            newHour+=(24*i/forCounter);
                            console.log("NEW HOUR:" + newHour);
                            newHour = newHour%24;
                            console.log("NEW HOUR:" + newHour + " - FINE");
                        }
                        var frequencyLabel = newHour + ":" + medication.time.split(":")[1];
                        newCell = $('<td class="col-4"></td>').text(frequencyLabel);
                    } else newCell = $('<td class="col-4"></td>').text('As needed');
                    newRow.append(newCell);

                    if (medication.time && medication.taken && medication.occurrence == i) newCell = $('<td class="col-2"></td>').html('<input class="form-check-input checkMedication" type="checkbox" id="checkboxNoLabel" value="" aria-label="..." checked></input>');
                    else if (medication.time) newCell = $('<td class="col-2"></td>').html('<input class="form-check-input checkMedication" type="checkbox" id="checkboxNoLabel" value="" aria-label="..."></input>');
                    else newCell = $('<td class="col-2"></td>').html('');
                    newRow.append(newCell);

                    newCell.find('.checkMedication').change(function () {
                        if ($(this).is(':checked'))
                            changeChecker(0, medication.prescriptionid, i, currentDate, 'create');
                        else if (medication.takenprescriptionid)
                            changeChecker(medication.takenprescriptionid, medication.prescriptionid, i, currentDate, 'delete');
                    });

                    $('#medicationsTable tbody').append(newRow);
                }
            }

            const symptomsResponse = await fetch('/api/getSymptomsByPatientAndDate?currentDate='+currentDate);
            if (!symptomsResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const symptoms = await symptomsResponse.json();
            
            var symptomDescription = '';
            if (symptoms[0]) symptomDescription = symptoms[0].description;

            $('#symptompsTextarea').text(symptomDescription);
        });

        for (let i = $('#medicationsTable tbody').children().length; i < 5; i++) {
            const newRow = $('<tr></tr>');

            let newCell = $('<td class="col-6"></td>').text('');
            newRow.append(newCell);
            newCell = $('<td class="col-4"></td>').text('');
            newRow.append(newCell);
            newCell = $('<td class="col-2"></td>').text('');
            newRow.append(newCell);

            $('#medicationsTable tbody').append(newRow);
        }
        
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function changeChecker(takenprescriptionId, prescriptionId, occurrence, currentDate, method) {
    fetch('/api/changeMedicationChecker?takenprescriptionId='+takenprescriptionId+'&prescriptionId='+prescriptionId+'&occurrence='+occurrence+'&currentDate='+currentDate+'&method='+method)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
};

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});