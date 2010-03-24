// keyboard shortcut
window.addEventListener('keydown', function(e) {
    // TODO: Make it configurable
    // Shift + Alt + S
    if(e.which === 83 && e.altKey) {
        var selection = '';
        if (window && window.getSelection) {
			selection = window.getSelection().toString();
		} else if (document && document.getSelection) {
			selection = document.getSelection().toString();
		}
        chrome.extension.sendRequest({selection: selection}, function(response) {});
    }
}, false);
