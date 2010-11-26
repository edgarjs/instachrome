var last_tab_id;
var badge_styles = {
    TEXT: 0,
    ICON: 1,
    CHROMED: 2
};

var badge = {
    idle: function(tabId) {
        var tabImg = 'images/default.png';
        if (parseInt($.db('badge_style')) === badge_styles.CHROMED) {
            tabImg = 'images/chromed_default.png';
        }
        function setIcon(id) {
            chrome.browserAction.setIcon({
                path: tabImg,
                tabId: id
            });
            chrome.browserAction.setBadgeText({
                text: '',
                tabId: id
            });
        }
        if(!tabId) {
            chrome.tabs.getSelected(null, function(tab) {
                setIcon(tab.id);
            });
        } else {
            setIcon(tabId);
        }
    },
    saving: function () {
        switch (parseInt($.db('badge_style'))) {
        case badge_styles.TEXT:
            // TODO Customize color
            chrome.browserAction.setBadgeBackgroundColor({
                color: [82, 168, 207, 255],
                tabId: last_tab_id
            });
            chrome.browserAction.setBadgeText({
                text: '...',
                tabId: last_tab_id
            });
            break;
        case badge_styles.ICON:
            chrome.browserAction.setIcon({
                path: 'images/saving.png',
                tabId: last_tab_id
            });
            break;
        case badge_styles.CHROMED:
            chrome.browserAction.setIcon({
                path: 'images/chromed_saving.png',
                tabId: last_tab_id
            });
            break;
        }
    },
    saved: function () {
        switch (parseInt($.db('badge_style'))) {
        case badge_styles.TEXT:
            chrome.browserAction.setBadgeBackgroundColor({
                color: [53, 181, 49, 255],
                tabId: last_tab_id
            });
            chrome.browserAction.setBadgeText({
                text: 'ok',
                tabId: last_tab_id
            });
            break;
        case badge_styles.ICON:
            chrome.browserAction.setIcon({
                path: 'images/saved.png',
                tabId: last_tab_id
            });
            break;
        case badge_styles.CHROMED:
            chrome.browserAction.setIcon({
                path: 'images/chromed_saved.png',
                tabId: last_tab_id
            });
            break;
        }
    },
    error: function () {
        switch (parseInt($.db('badge_style'))) {
        case badge_styles.TEXT:
            chrome.browserAction.setBadgeBackgroundColor({
                color: [255, 0, 0, 255],
                tabId: last_tab_id
            });
            chrome.browserAction.setBadgeText({
                text: 'err!',
                tabId: last_tab_id
            });
            break;
        case badge_styles.ICON:
            chrome.browserAction.setIcon({
                path: 'images/error.png',
                tabId: last_tab_id
            });
            break;
        case badge_styles.CHROMED:
            chrome.browserAction.setIcon({
                path: 'images/chromed_error.png',
                tabId: last_tab_id
            });
            break;
        }
    }
};

function onComplete(xhr) {
    try {
        if (xhr.srcElement.status == 201) {
            if ($.db('auto_close') === '1') {
                chrome.tabs.remove(last_tab_id);
            } else {
                badge.saved();
            }
        } else {
            badge.error();
        }
    } catch(e) {}
}

// TODO: gmail support for mails.
function sendRequest(url, selection, title) {
    var username = $.db('username');
    var password = $.db('password') || '';

    if (!username) {
        badge.idle();
        chrome.tabs.create({
            url: chrome.extension.getURL('options.html#setup')
        });
        return;
    }


    chrome.tabs.get(last_tab_id, function(tab) {

        if(/^https?:\/\/www\.google\.com\/reader/.test(url)) {
            chrome.tabs.sendRequest(tab.id, {}, function(response) {
                if(response.title && response.url) {
                    sendRequest(response.url, response.selection, response.title);
                } else {
                    badge.idle(tab.id);
                }
            });
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = onComplete;
            title = encodeURIComponent(title || tab.title);
            var params = {
                url: url,
                username: username,
                password: password,
                selection: selection || url.match(/https?:\/\/([^\/]+)/)[1]
            };
            title = title ? ("&title=" + title) : "&auto-title=1";
            xhr.open("GET", 'https://www.instapaper.com/api/add?' + $.param(params) + title, true);
            xhr.send();
        }
    });
}

function readLater(tab, selection) {
    last_tab_id = tab.id;
    badge.saving();
    sendRequest(tab.url, selection);
}

chrome.tabs.onUpdated.addListener(function(tabId) {
    badge.idle(tabId);
});
chrome.browserAction.onClicked.addListener(readLater);
// from key shortcut
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (sender.tab) {
        if (request.hasOwnProperty('keystroke')) {
            var shortcut = $.db('shortcut');
            var ctrlKey = (shortcut.ctrlKey == request.keystroke.ctrlKey),
            altKey = (shortcut.altKey == request.keystroke.altKey),
            shiftKey = (shortcut.shiftKey == request.keystroke.shiftKey),
            keyCode = (shortcut.keyCode == request.keystroke.keyCode);
            sendResponse({
                shortcutPressed: (ctrlKey && altKey && shiftKey & keyCode)
            });
        } else if (request.hasOwnProperty('selection')) {
            readLater(sender.tab, request.selection);
        }
    }
});
