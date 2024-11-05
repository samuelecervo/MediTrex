$(document).ready(function () {
    $('#datePicker').val(new Date().toDateInputValue());
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
    var date = new Date();
    $('#showMonthYear').text(months[date.getMonth()] + ' ' + date.getFullYear());

    setCalendar(date);
    setMedicationsList($('#datePicker').val());
    setClicks(date.getFullYear(), date.getMonth()+1);

    $(".addAppBTN").click(function() {
        openNewAppModal();
    });

    $(".closeNewApp").click(function() {
        $('#newAppointmentModal').hide();
    });

    $("#addNewAppBTN").click(function() {
        addNewAppointment();
    })

    $('#leftArrow').click(function () {
        date = new Date(date.setMonth(date.getMonth() - 1));
        $('#showMonthYear').text(months[date.getMonth()] + ' ' + date.getFullYear());
        setCalendar(date);
    });

    $('#rightArrow').click(function () {
        date = new Date(date.setMonth(date.getMonth() + 1));
        $('#showMonthYear').text(months[date.getMonth()] + ' ' + date.getFullYear());
        setCalendar(date);
    });

    $("#formFrequency").change(function () {
        var selectedValue = $(this).val();

        if (selectedValue === '0') {
            $('#formTime').hide();
        } else {
            $('#formTime').show();
        }
    });

    $("#datePicker").change(function () {
        setMedicationsList($('#datePicker').val());
    });

    $("#addPrescriptionButton").click(function () {
        var formMedication = $('#formMedication').val();
        var formStartingDate = $('#formStartingDate').val();
        var formEndingDate = $('#formEndingDate').val();
        var formFrequency = $('#formFrequency').val();
        var formTime = $('#formTime').val();
        var patientId = $('#formPatientName').data('patientId');
        var prescriptionId = $('#newPrescriptionModal').data('id');

        if (formMedication === '') {
            $('#newPrescriptionModalError').text('Fill the MEDICATION field');
            return;
        } else if (formStartingDate === '') {
            $('#newPrescriptionModalError').text('Fill the STARTING DATE field');
            return;
        } else if (formEndingDate === '') {
            $('#newPrescriptionModalError').text('Fill the ENDING field');
            return;
        } else if (formStartingDate > formEndingDate) {
            $('#newPrescriptionModalError').text('STARTING DATE can\'t be greater than ENDING DATE');
            return;
        } else if (!(formFrequency >= 0 && formFrequency <= 3)) {
            $('#newPrescriptionModalError').text('Error, reload the page and retry');
            return;
        } else if (formFrequency >= 1 && formTime === '') {
            $('#newPrescriptionModalError').text('Fill the TIME field');
            return;
        } else {
            fetch('/api/addPrescription?prescriptionId=' + prescriptionId + '&patientId=' + patientId + '&medication=' + formMedication + '&startingdate=' + formStartingDate + '&endingdate=' + formEndingDate + '&frequency=' + formFrequency + '&time=' + formTime)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data) {
                        setMedicationsList($('#datePicker').val());
                        $('#newPrescriptionModal').modal('hide');
                    }

                    else {
                        $('#newPrescriptionModalError').text('Another prescription overlapped');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
    });

    $(window).on('resize', function () {
        $('.day-header').each(function () {
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
        var childNumber = i + 7;
        $(".day-cell:nth-child(" + childNumber + ")").html('');

    }

    for (let i = 1; i <= daysInMonth; i++) {
        var childNumber = i + firstDay.getDay() + 7;
        $(".day-cell:nth-child(" + childNumber + ")").html('<div class="day day-number">' + i + '</div> <div class="day day-desc"><ul class="list-group"></ul></div>');
    }

    for (let i = 1; i <= 49 - firstDay.getDay() - daysInMonth; i++) {
        var childNumber = i + firstDay.getDay() + daysInMonth + 7;
        $(".day-cell:nth-child(" + childNumber + ")").html('');
    }

    fillCalendar(date);
}

function fillCalendar(date) {
    $(".day-cell").off();
    fetch('/api/getAppointments?month=' + (date.getMonth() + 1) + '&year=' + date.getFullYear())
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(function (appointment) {
                var dataAppuntamento = new Date(appointment.date);
                var giornoAppuntamento = dataAppuntamento.getDate();
                var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                var cella = firstDay.getDay() + 7 + giornoAppuntamento;
                var newElem = '<li class="list-group-item">' + appointment.name.charAt(0) + '. ' + appointment.surname + ' (' + appointment.time.split(":")[0] + ':' + appointment.time.split(":")[1] + ')</li>';
                $(".day-cell:nth-child(" + cella + ") > .day-desc > ul").append(newElem);
            });
            setClicks(date.getFullYear(), date.getMonth() + 1)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function setClicks(year, month) {
    month=("0"+month).slice(-2);
    $('.day-cell').click( function () {
        if ($(this).find('.day-number').text()!=="") {
            day=("0"+$(this).find(".day-number").text()).slice(-2);
            date=year+"/"+month+"/"+day;
            openAppointmentsModal(date)
        }
    });
}

function openPrescriptionModal(id, patient) {
    if (id != 0) {
        fetch('/api/getMedicationById?prescriptionId=' + id)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                data = data[0];
                $('#formMedication').val(data.medication);
                $('#formStartingDate').val(new Date(data.fromdate).toISOString().substring(0, 10));
                $('#formEndingDate').val(new Date(data.todate).toISOString().substring(0, 10));
                $('#formFrequency').val(data.frequency);
                if (data.time) {
                    $('#formTime').val(data.time);
                    $('#formTime').show();
                }

                else {
                    $('#formTime').val('');
                    $('#formTime').hide();
                }
                $('#formPatientName').text('Patient: ' + patient.name + ' ' + patient.surname);
                $('#formPatientName').data('patientId', patient.userid);
                $('#newPrescriptionModalError').text('');
                $('#newPrescriptionModal').data('id', id);
                $('#newPrescriptionModal').modal('show');
                
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    else {
        $('#formMedication').val('');
        $('#formStartingDate').val('');
        $('#formEndingDate').val('');
        $('#formFrequency').val(0);
        $('#formTime').hide();
        $('#formPatientName').text('Patient: ' + patient.name + ' ' + patient.surname);
        $('#formPatientName').data('patientId', patient.userid);
        $('#newPrescriptionModalError').text('');
        $('#newPrescriptionModal').data('id', id);
        $('#newPrescriptionModal').modal('show');
    }
}

function deletePrescription(id) {
    fetch('/api/deletePrescription?prescriptionId=' + id)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                setMedicationsList($('#datePicker').val());
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function openAppointmentsModal(date) {
    fetch('/api/getAppointmentsByDate?date=' + date)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            $('#appointmentsTable tbody').html('');
            data.forEach(function (appointment) {
                var newRow = $('<tr></tr>');
                var newCell = $('<td class="col-6"></td>').text(appointment.name + ' ' + appointment.surname);
                newRow.append(newCell);
                newCell = $('<td class="col-3"></td>').text(appointment.time.split(":")[0]+':'+appointment.time.split(":")[1]);
                newRow.append(newCell);
                newCell = $('<td class="col-3"></td>').html('<input class="form-check-input checkAppointment" type="checkbox" id="checkboxNoLabel" value="" aria-label="..."></input>');
                
                if (appointment.visited)
                    newCell.find(".checkAppointment").prop('checked', true);
                newRow.append(newCell);

                newCell.find('.checkAppointment').change(function () {
                    changeChecker(appointment.appointmentid, $(this).is(':checked'));
                });

                $('#appointmentsTable tbody').append(newRow);
                
            });

            $('#appointmentsModal').modal('show');

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

async function setMedicationsList(currentDate) {
    try {
        const response = await fetch('/api/getPatientsList');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const patients = await response.json();

        const patientRows = await Promise.all(patients.map(async (patient) => {
            console.log(JSON.stringify(patient));
            const newRow = $('<tr></tr>');

            let newCell = $('<td class="col-3"></td>').text(patient.name + ' ' + patient.surname);
            newRow.append(newCell);

            const medicationsResponse = await fetch('/api/getMedicationsByPatientAndDate?patientId=' + patient.userid + '&currentDate=' + currentDate);
            if (!medicationsResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const medications = await medicationsResponse.json();

            var medicationsList = medications.map(medication => {
                if (medication.time) return `<li><i class="bi bi-x-circle delPres" data-id="${medication.prescriptionid}" type="button"></i><div class="medText">${medication.medication} (${medication.time.split(":")[0]}:${medication.time.split(":")[1]} ${medication.frequency}/d)</div><i class="bi bi-pencil editPres" data-id="${medication.prescriptionid}" type="button"></i></li>`;
                else return `<li><i class="bi bi-x-circle delPres" data-id="${medication.prescriptionid}" type="button"></i><div class="medText">${medication.medication} (as needed)</div><i class="bi bi-pencil editPres" data-id="${medication.prescriptionid}" type="button"></i></li>`;
            });

            const symptomsResponse = await fetch('/api/getSymptomsByPatientAndDate?patientId=' + patient.userid + '&currentDate=' + currentDate);
            if (!symptomsResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const symptoms = await symptomsResponse.json();

            var symptomDescription = '';
            if (symptoms[0]) symptomDescription = symptoms[0].description;

            newCell = $('<td class="col-4"></td>').html('<ul class="medications-list-group">' + medicationsList.join('') + '</ul>');
            newRow.append(newCell);

            
            newCell.find('.editPres').click(function () {
                openPrescriptionModal($(this).data("id"), patient);
            });

            newCell.find('.delPres').click(function () {
                deletePrescription($(this).data("id"));
            });


            newCell = $('<td class="col-4"></td>').text(symptomDescription);
            newRow.append(newCell);
            newCell = $('<td class="col-1"></td>').html('<i class="bi bi-plus-circle-fill fa-lg newPrescriptionButton" type="button"></i>');
            newRow.append(newCell);

            newCell.find('.newPrescriptionButton').click(function () {
                openPrescriptionModal(0, patient);
            });

            return newRow;
        }));

        $('#patientsTable tbody').html(patientRows);
        for (let i = $('#patientsTable tbody').children().length; i < 5; i++) {
            const newRow = $('<tr></tr>');

            let newCell = $('<td class="col-3"></td>').text('');
            newRow.append(newCell);
            newCell = $('<td class="col-4"></td>').text('');
            newRow.append(newCell);
            newCell = $('<td class="col-4"></td>').text('');
            newRow.append(newCell);
            newCell = $('<td class="col-1"></td>').text('');
            newRow.append(newCell);

            $('#patientsTable tbody').append(newRow);
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function changeChecker(appId, checked) {
    fetch('/api/changeAppointmentChecker?appId='+appId+'&newChecked='+(checked))
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

function openNewAppModal() {
    $("#patientListApp").html('');
    $("#formAppDate").val('');
    $("#formAppTime").val('');
    fetch('/api/getPatientsList')
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        data.forEach(function (patient) {
            $("#patientListApp").append('<option value='+patient.userid+'>' + patient.name + ' ' + patient.surname + '</option>')
                       
        });

        $('#newAppointmentModal').show();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function addNewAppointment() {
    var patientId = $("#patientListApp").val();
    var date = $("#formAppDate").val();
    var time = $("#formAppTime").val();
    if (parseInt(patientId) > 0 && date && time) {
        fetch('/api/addNewAppointment?patientId='+patientId+'&date='+date+'&time='+time)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        location.reload();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    }

}

Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});