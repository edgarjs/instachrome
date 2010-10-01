(function($) {
    $.flash = function(msg) {
        $('.flash').text(msg).fadeIn('fast');
    };
})(jQuery);

var Options = function() {
    var values = {
        username: null,
        password: null,
        show_popup: '1',
        auto_close: false,
        badge_style: 0,
        shortcut: {
            keyCode: 83,
            altKey: true,
            ctrlKey: false,
            shiftKey: true
        },
        description_style: 1
    };

    var ui = {
        username: $('input#username'),
        password: $('input#password'),
        show_popup: $('input#show_popup'),
        auto_close: $('input#auto_close'),
        badge_style: $('select#badge_style'),
        shortcut: $('input#shortcut'),
        description_style: $('select#description_style')
    };

    var dbOrDefault = function(db_key) {
        return $.db(db_key) || values[db_key];
    };

    var authenticateCredentials = function() {
        var xhr = new XMLHttpRequest();
        var username = encodeURIComponent(ui.username.val());
        var password = encodeURIComponent(ui.password.val());
        xhr.onreadystatechange = function(response) {
            if(response.srcElement && response.srcElement.readyState == 4) {
                $('.column.label.auth').show('fast').removeClass('ok error');
                if(response.srcElement.status == 200) {
                    $('.column.label.auth').addClass('ok').text('Your credentials are valid.');
                } else {
                    $('.column.label.auth').addClass('error').text('Your username or password is incorrect. Please double check them.');
                }
            }
        }
        xhr.open("GET", 'https://www.instapaper.com/api/authenticate?username=' + username + '&password=' + password, true);
        xhr.send();
    };

    ui.username.bind('change', authenticateCredentials);
    ui.password.bind('change', authenticateCredentials);

    return {
        humanizeKeystrokes: function(e) {
            var key = String.fromCharCode(e.keyCode);
            var special = "";
            if (e.ctrlKey) {
                special += "Ctrl + ";
            }
            if (e.altKey) {
                special += "Alt + ";
            }
            if (e.shiftKey) {
                special += "Shift + ";
            }
            return special + key;
        },

        restore: function() {
            if (location.hash === '#setup') {
                $.flash('Enter your Instapaper credentials in order to save an URL.');
            }
            ui.username.val(dbOrDefault('username'));
            ui.password.val(dbOrDefault('password'));
            if (dbOrDefault('show_popup') === '1') {
                ui.show_popup.attr('checked', true);
            }
            if (dbOrDefault('auto_close') === '1') {
                ui.auto_close.attr('checked', true);
            }
            ui.badge_style.val(dbOrDefault('badge_style'));
            ui.shortcut.val(this.humanizeKeystrokes(dbOrDefault('shortcut')))
            .data('keys', dbOrDefault('shortcut'));
            ui.description_style.val(dbOrDefault('description_style'));
        },

        save: function() {
            $.db('username', ui.username.val());
            $.db('password', ui.password.val());
            $.db('show_popup', ui.show_popup.is(':checked') ? '1': '0');
            $.db('auto_close', ui.auto_close.is(':checked') ? '1': '0');
            $.db('badge_style', ui.badge_style.val());
            $.db('shortcut', ui.shortcut.data('keys'));
            $.db('description_style', ui.description_style.val());

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

    $('#shortcut').keydown(function(e) {
        $(this).val(o.humanizeKeystrokes(e)).data('keys', {
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            keyCode: e.which
        });
        return false;
    });
});
