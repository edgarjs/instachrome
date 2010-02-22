var lastTabId;

function readLater(tab) {
	lastTabId = tab.id;
	chrome.browserAction.setBadgeText({text: 'saving', tabId: lastTabId});
	saveURL(tab.url);
}

function savedComplete(xhr) {
	if(xhr.srcElement.status == 201) {
		chrome.browserAction.setBadgeText({text: 'saved', tabId: lastTabId});
	} else {
		chrome.browserAction.setBadgeText({text: 'error', tabId: lastTabId});
	}
}

function saveURL(url) {
	var xhr = new XMLHttpRequest();
	var username = localStorage['username'];
	var password = localStorage['password'] || '';
	
	if(!username) {
		chrome.browserAction.setIcon({path: 'images/default.png', tabId: lastTabId});
		window.open(chrome.extension.getURL('options.html') + '#setup');
		return;
	}
	
	username = encodeURIComponent(username);
	password = encodeURIComponent(password);
	url = encodeURIComponent(url);
	
	xhr.onreadystatechange = savedComplete;
	var params = "?url=" + url + "&username=" + username + "&password=" + password + "&auto-title=1";
	
	xhr.open("GET", 'https://www.instapaper.com/api/add' + params, true);
	xhr.send();
}

chrome.browserAction.onClicked.addListener(readLater);
// For some reason, tghis event doesn't work.
// window.addEventListener('keyup', function(e) {
// 	switch (e.which) {
//         // Shift + Alt + S
// 	    case 83:
// 	        if(e.altKey) {
// 				chrome.tabs.getSelected(null, function(tab) {
// 					readLater(tab);
// 				});
// 	        }
// 	        break;
// 	 }
// }, false);
