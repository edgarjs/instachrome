function showFlashMsg(msg) {
    var status = document.getElementById("status");
    status.innerHTML = msg;
    status.style.display = 'block';
    setTimeout(function() {
        status.innerHTML = "";
        status.style.display = 'none';
    },
    5000);
}

function save_options() {
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    localStorage["username"] = username.value;
    localStorage["password"] = password.value;

    showFlashMsg('Options Saved!');
}

function restore_options() {
    var username = localStorage["username"];

    if (document.location.hash == '#setup') {
        showFlashMsg("Enter your Instapaper username and password.");
    }

    if (!username) {
        return;
    }
    document.getElementById('username').value = username;
}