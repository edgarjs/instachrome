// keyboard shortcut
function getWindowSelection() {
    var selection = '';
    if (window && window.getSelection) {
        selection = window.getSelection().toString();
    } else if (document && document.getSelection) {
        selection = document.getSelection().toString();
    }
    return selection;
}

window.addEventListener('keydown', function(e) {
    chrome.extension.sendRequest({keystroke: {
        keyCode: e.keyCode,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey
    }}, function(response) {
        if(response.shortcutPressed) {
            chrome.extension.sendRequest({selection: getWindowSelection()}, function(r) {});
        }
    });
}, false);

