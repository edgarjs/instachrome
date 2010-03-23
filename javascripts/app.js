(function($) {
    $.db = function(attr, val) {
        if(typeof val === 'undefined') {
            return localStorage[attr];
        } else {
            localStorage[attr] = val;
            return val;
        }
    };
})(jQuery);
