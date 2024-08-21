document.addEventListener('DOMContentLoaded', () => {
    
    
    $(document).ready(function () {
        //ACCEPT REQUEST BUTTON
        $('#accept').click(function() {
            fetch('/api/acceptInTreatment?patientid=' + $(this).data("id"))
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    location.reload();
                    alert("You have accepted the request!");
                    return response.json();
                }).catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        
        });

        // REJECT REQUEST BUTTON 
        $('#reject').click(function() {
            fetch('/api/declineInTreatment?patientid=' + $(this).data("id"))
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    location.reload();
                    alert("The patient was removed!");
                    return response.json();
                }).catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        
        });
});
});