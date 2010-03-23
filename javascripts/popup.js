$(function() {
    var show_popup = $.db('show_popup') === "1";
    if(!show_popup) {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.extension.getBackgroundPage().readLater(tab);
        });
        window.close();
    } else {
        //show
    }
});
