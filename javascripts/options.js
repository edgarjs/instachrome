(function($) {
    $.flash = function(msg) {
        $('.flash').text(msg).fadeIn('fast');
    };
})(jQuery);

var Options = function() {
    var BADGE_STYLES = [
        'Red Text',
        'Tick Icon'
    ];
    
    var values = {
        username: null,
        password: null,
        show_popup: false,
        auto_close: false,
        badge_style: 0
    };
    
    var ui = {
        username: $('input#username'),
        password: $('input#password'),
        show_popup: $('input#show_popup'),
        auto_close: $('input#auto_close'),
        badge_style: $('select#badge_style')
    };
    
    
    return {
        restore: function() {
            if(location.hash === '#setup') {
                $.flash('Enter your Instapaper credentials in order to save an URL.');
            }
            ui.username.val($.db('username'));
            ui.password.val($.db('password'));
            if($.db('show_popup') === '1') {
                ui.show_popup.attr('checked', true);
            }
            if($.db('auto_close') === '1') {
                ui.auto_close.attr('checked', true);
            }
            ui.badge_style.val($.db('badge_style'));
        },

        save: function() {
            $.db('username', ui.username.val());
            $.db('password', ui.password.val());
            $.db('show_popup', ui.show_popup.is(':checked') ? '1' : '0');
            $.db('auto_close', ui.auto_close.is(':checked') ? '1' : '0');
            $.db('badge_style', ui.badge_style.val());
            
            $.flash('Options saved successfully!');
        }
    };
};


$(function() {
    var o = new Options();
    o.restore();
    
    $('.flash').click(function() {
        $(this).fadeOut('slow');
        return false;
    });
    
    $('.close').click(function() {
        window.close();
    });
    
    $('form.options').submit(function() {
        o.save();
        return false;
    });
});
