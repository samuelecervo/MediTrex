document.addEventListener('DOMContentLoaded', () => {
    $(document).ready(function () {
        checkInTreatment();
        $('.contactBtn').click(function () {
            fetch('/api/addRequest?doctorId=' + $(this).data("id"))
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data) {
                        if (data[0].result == 'ok') {
                            //console.log("TUTTO OK");
                            const socket = io({
                                query: {
                                    userid: userId
                                }
                            });
                            socket.on('connect', () => {
                                //console.log('Connesso al server');
                                const message = {
                                    sender: userId,
                                    recipient: $(this).data("id"),
                                    msg: "Hello",
                                    name: userName,
                                    surname: userSurname,
                                    timestamp: new Date(),
                                    pending: true,
                                    gp: 0
                                };
                                socket.emit('chat message', message);
                                //console.log('messaggio inviato', message);
                            });
                            $(this).prop('disabled', true);
                            $(this).parent().parent().parent().addClass("card_disabled");
                            $(this).css("background", "grey");
                            $(this).text("Request sent");
                        } else {
                            //console.log("ERROR: ", data[0].result);
                        }
                    } else {
                        alert("Impossibile soddisfare la richiesta al momento, ci dispiace, riprovare piu' tardi.");
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        });
    });
});

// SEND GP REQUEST FETCH OPERATION
function sendGPRequest(button) {
    fetch('/api/addGPRequest?doctorId=' + button.data("id"))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                button.prop('disabled', true);
                button.css("background", "grey");
                button.text("GP request sent");
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// CHECK INTREATMENT BETWEEN PATIENT AND DOCTOR
function checkInTreatment() {
    fetch('/api/getInTreatment')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(function (pair) {
                $(`#card${pair.doctor}`).addClass('card_disabled');
                var mainBtn = $(`#card${pair.doctor} > .solu_description > .buttons > .contactBtn`);
                mainBtn.prop('disabled', true);
                mainBtn.css("background", "grey");
                mainBtn.text("Request already sent");
                if (pair.pending == false) {
                    if (pair.gp == 0) {
                        var newButton = $("<button></button>");
                        newButton.addClass("read_more_btn GPBtn");
                        newButton.text("Choose as GP");
                        newButton.data("id", mainBtn.data("id"));
                        mainBtn.parent().append(newButton);
                        newButton.click(function () {
                            sendGPRequest(newButton)
                        });
                    } else if (pair.gp == 1) {
                        var newButton = $("<button></button>");
                        newButton.addClass("read_more_btn GPBtn");
                        newButton.prop('disabled', true);
                        newButton.css("background", "grey");
                        newButton.text("GP request sent");
                        mainBtn.parent().append(newButton);

                    } else if (pair.gp == 2) {
                        $(`#card${pair.doctor} > .solu_gp`).prop("hidden", false);
                    }
                }

            })
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}