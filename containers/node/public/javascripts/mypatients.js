$(document).ready(function () {
    //ACCEPT REQUEST BUTTON
    $('.acceptButton').click(function() {
        fetch('/api/acceptInTreatment?patientid=' + $(this).data("id"))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                location.reload();
                return response.json();
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    
    });

    // REJECT REQUEST BUTTON 
    $('.rejectButton').click(function() {
        fetch('/api/declineInTreatment?patientid=' + $(this).data("id"))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                location.reload();
                return response.json();
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    
    });

    // REMOVE REQUEST BUTTON 
    $('.removeButton').click(function() {
        fetch('/api/removeinTreatment?patientid=' + $(this).data("id"))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                location.reload();
                return response.json();
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });

    //ACCEPT REQUEST BUTTON
    $('.gpAcceptButton').click(function() {
        fetch('/api/acceptGP?patientid=' + $(this).data("id"))
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            location.reload();
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});