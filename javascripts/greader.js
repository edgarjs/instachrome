chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    var entry = document.getElementById('current-entry');
    if(entry) {
        var entryTitle = entry.getElementsByClassName('entry-container')[0]
            .getElementsByClassName('entry-title')[0];
        var entryUrl = entryTitle.getElementsByClassName('entry-title-link')[0];
        sendResponse({
            title: entryTitle.innerText,
            url: entryUrl.href,
            selection: getWindowSelection()
        });
    } else {
        sendResponse({saved: false});
        alert("You don't have any entry expanded. Once you have an entry expanded try saving it for later.");
    }
});
