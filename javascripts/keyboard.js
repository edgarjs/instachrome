// keyboard shortcut
window.addEventListener('keydown', function(e) {
    // TODO: Make it configurable
    // Shift + Alt + S
    if(e.which === 83 && e.altKey) {
        chrome.extension.sendRequest({source: "shortcut"}, function(response) {});
    }
}, false);
