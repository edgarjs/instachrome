var lastTabId;

function savedComplete(xhr) {
	if(xhr.srcElement.status == 201) {
		chrome.browserAction.setIcon({path: 'images/saved.png', tabId: lastTabId});
	} else {
		chrome.browserAction.setIcon({path: 'images/error.png', tabId: lastTabId});
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

chrome.browserAction.onClicked.addListener(function(tab) {
	lastTabId = tab.id;
	chrome.browserAction.setIcon({path: 'images/saving.png', tabId: lastTabId});
	saveURL(tab.url);
});
