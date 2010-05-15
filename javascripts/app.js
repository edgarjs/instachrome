(function($) {
    $.db = function(attr, val) {
        var isJSON = function(str) {
            return (typeof str === 'string' && /^\{.*\}$/.test(str));
        };
        if(typeof val === 'undefined') {
            return isJSON(localStorage[attr]) ? JSON.parse(localStorage[attr]) : localStorage[attr];
        } else {
            if(val.constructor === Object) {
                localStorage[attr] = JSON.stringify(val);
            } else {
                localStorage[attr] = val;
            }
            return val;
        }
    };
})(jQuery);
