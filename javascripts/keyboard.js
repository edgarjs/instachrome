// keyboard shortcut
window.addEventListener('keydown', function(e) {
    chrome.extension.sendRequest({keystroke: {
        keyCode: e.keyCode,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey
    }}, function(response) {
        if(response.shortcutPressed) {
            var selection = '';
            if (window && window.getSelection) {
    			selection = window.getSelection().toString();
    		} else if (document && document.getSelection) {
    			selection = document.getSelection().toString();
    		}
            chrome.extension.sendRequest({selection: selection}, function(r) {});
        }
    });
}, false);
