var last_tab_id,
    skip_auto_close;
var badge_styles = {
    TEXT: 0,
    ICON: 1,
    CHROMED: 2,
    UNREAD: 3
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
            var feed = $.db('rssfeed');
            if(feed && $.db('badge_style') == badge_styles.UNREAD) {
               var xhr = new XMLHttpRequest();
               xhr.onreadystatechange = function() {
                  if(xhr.readyState == 4 &&
                        xhr.status == 200) {
                     badgetext = xhr.responseText.match(/<item>/g).length;
                     if (badgetext > 0) {
                        chrome.browserAction.setBadgeText({
                           text: '' + badgetext
                        });
                     }
                  }
               };
               xhr.open('GET', feed, true);
               xhr.send();
            } else {
               chrome.browserAction.setBadgeText({
                  text: '',
                  tabId: id
               });
            }
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
        case badge_styles.UNREAD:
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
        case badge_styles.UNREAD:
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
        case badge_styles.UNREAD:
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
            if ($.db('auto_close') === '1' && !skip_auto_close) {
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
function sendRequest(url, selection, title, source) {
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
            var params = {
                url: url,
                username: username,
                password: password,
                selection: selection || url.match(/https?:\/\/([^\/]+)/)[1]
            };
            if(source == 'contextual') {
                title = "&auto-title=1";
            } else {
                title = "&title=" + encodeURIComponent(title || tab.title);
            }
            xhr.open("GET", 'https://www.instapaper.com/api/add?' + $.param(params) + title, true);
            xhr.send();
        }
    });
}

function readLater(tab, selection, source) {
    last_tab_id = tab.id;
    badge.saving();
    skip_auto_close = (source === 'contextual');
    sendRequest(tab.url, selection, null, source);
}

if($.db('cx_read_later') === '1') {
    chrome.contextMenus.create({
        title: 'Read later (send to instapaper)',
        contexts: ['link'],
        onclick: function(data, tab) {
            readLater({id: tab.id, url: data.linkUrl}, null, 'contextual');
        }
    });
}

if($.db('cx_text_view') === '1') {
    chrome.contextMenus.create({
        title: 'Text view',
        contexts: ['page', 'link'],
        onclick: function(data, tab) {
            chrome.tabs.update(tab.id, {
                url: "http://www.instapaper.com/text?u=" + encodeURIComponent(data.linkUrl || data.pageUrl)
            });
        }
    });
}

if($.db('cx_unread') === '1') {
    chrome.contextMenus.create({
        title: 'Go to your unread items',
        contexts: ['all'],
        onclick: function(data, tab) {
            chrome.tabs.create({
                url: "http://www.instapaper.com/u"
            });
        }
    });
}

if($.db('cx_starred') === '1') {
    chrome.contextMenus.create({
        title: 'Go to your starred items',
        contexts: ['all'],
        onclick: function(data, tab) {
            chrome.tabs.create({
                url: "http://www.instapaper.com/starred"
            });
        }
    });
}

if($.db('cx_archive') === '1') {
    chrome.contextMenus.create({
        title: 'Go to your archived items',
        contexts: ['all'],
        onclick: function(data, tab) {
            chrome.tabs.create({
                url: "http://www.instapaper.com/archive"
            });
        }
    });
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
