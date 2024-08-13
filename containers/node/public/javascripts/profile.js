
// EDIT PROFILE MODE
function enableEditProfile(){
    document.getElementById('updateButton').hidden = false;
    document.getElementById('discardButton').hidden = false;
    document.getElementById('editButton').style.display = 'none';
    document.getElementById('pass').style.display = 'block';
    document.getElementById('oldPass').disabled = false;
    document.getElementById('oldPass').placeholder = "Insert current password";

}

// VIEW PROFILE MODE
function disableEditProfile(){
    document.getElementById('updateButton').hidden = true;
    document.getElementById('discardButton').hidden = true;
    document.getElementById('editButton').style.display = 'block';
    document.getElementById('pass').style.display = 'none';
    document.getElementById('oldPass').disabled = true;
    document.getElementById('oldPass').placeholder = "**********************";
}

function restoreBio(bio){
    document.getElementById('bio').value = bio;
}