var last_tab_id;
var badge_styles = {
    TEXT: 0,
    ICON: 1
};

function onComplete(xhr) {
    // TODO: validate badge style
    if(xhr.srcElement.status == 201) {
        if($.db('auto_close') === '1') {
            chrome.tabs.remove(last_tab_id);
        } else {
            chrome.browserAction.setBadgeText({text: 'done', tabId: last_tab_id});
        }
    } else {
        chrome.browserAction.setBadgeText({text: 'error', tabId: last_tab_id});
    }
}

function sendRequest(url) {
    var xhr = new XMLHttpRequest();
    var username = $.db('username');
    var password = $.db('password') || '';

    if(!username) {
        chrome.browserAction.setIcon({path: 'images/default.png', tabId: last_tab_id});
        chrome.tabs.create({url: chrome.extension.getURL('options.html')});
        return;
    }

    username = encodeURIComponent(username);
    password = encodeURIComponent(password);
    url = encodeURIComponent(url);
    
    xhr.onreadystatechange = onComplete;
    // TODO: set selection to the page selected text, or excerpt
    var params = "?url=" + url + "&username=" + username + "&password=" + password + "&auto-title=1";

    xhr.open("GET", 'https://www.instapaper.com/api/add' + params, true);
    xhr.send();
}

function readLater(tab) {
    last_tab_id = tab.id;
    switch(parseInt($.db('badge_style'))) {
        case badge_styles.TEXT:
            chrome.browserAction.setBadgeText({text: 'saving', tabId: last_tab_id});
            break;
        case badge_styles.ICON:
            // TODO: use icon
            chrome.browserAction.setBadgeText({text: 'saving', tabId: last_tab_id});
            break;
    }
    sendRequest(tab.url);
}

chrome.browserAction.onClicked.addListener(readLater);
// from key shortcut
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(sender.tab) {
        readLater(sender.tab);
    }
 });
