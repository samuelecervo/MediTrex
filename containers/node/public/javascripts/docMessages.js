// ACCEPT BUTTON FOR DOCTOR MESSAGE PAGE
function createAccept(chatId){
    const accept = document.createElement('button');
    const where = document.getElementById(`upButtons${chatId}`);
    accept.textContent = "ACCEPT REQUEST";
    accept.setAttribute("id", "accept" + chatId);
    accept.classList.add("acceptDeclineBtn");
    accept.setAttribute("data-userid", chatId);
    accept.addEventListener('click', acceptRequest);
    where.append(accept);
  }

// DELETE BUTTON FOR DOCTOR MESSAGE PAGE
function createDelete(chatId){
    const decline = document.createElement('button');
    const where = document.getElementById(`upButtons${chatId}`);
    decline.textContent = "DELETE CHAT";
    accept.setAttribute("id", "decline" + chatId);
    decline.classList.add("acceptDeclineBtn");
    decline.setAttribute("data-userid", chatId);
    decline.addEventListener('click', declineRequest);
    where.append(decline);
}

// ACCEPT GP BUTTON FOR DOCTOR MESSAGE PAGE
function createAcceptGP(chatId){
    //console.log("ENTRATO");
    const acceptGP = document.createElement('button');
    const where = document.getElementById(`upButtons${chatId}`);
    acceptGP.textContent = "ACCEPT GP REQUEST";
    accept.setAttribute("id", "acceptGP" + chatId);
    acceptGP.classList.add("acceptDeclineBtn");
    acceptGP.setAttribute("data-userid", chatId);
    acceptGP.addEventListener('click', acceptGPRequest);
    where.append(acceptGP);
}

// ACCEPT REQUEST FETCH OPERATION
function acceptRequest(event){
    fetch('/api/acceptInTreatment?patientid=' + event.currentTarget.getAttribute('data-userid'))
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        location.reload();
        return response.json();
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        });
}

// DECLINE REQUEST FETCH OPERATION
function declineRequest(event){
    fetch('/api/declineInTreatment?patientid=' + event.currentTarget.getAttribute('data-userid'))
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        location.reload();
        return response.json();
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    }

// ACCEPT GP REQUEST FETCH OPERATION
function acceptGPRequest(event){
    fetch('/api/acceptGP?patientid=' + event.currentTarget.getAttribute('data-userid'))
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
    }