(function($) {
    $.flash = function(msg) {
        $('.flash').html(msg).fadeIn('fast');
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
        cx_read_later: '1',
        cx_text_view: '0',
        cx_unread: '0',
        cx_starred: '0',
        cx_archive: '0'
    };

    var ui = {
        username: $('input#username'),
        password: $('input#password'),
        show_popup: $('input#show_popup'),
        auto_close: $('input#auto_close'),
        badge_style: $('select#badge_style'),
        shortcut: $('input#shortcut'),
        cx_read_later: $('input#cx_read_later'),
        cx_text_view: $('input#cx_text_view'),
        cx_unread: $('input#cx_unread'),
        cx_starred: $('input#cx_starred'),
        cx_archive: $('input#cx_archive')
    };

    var dbOrDefault = function(db_key) {
        return $.db(db_key) || values[db_key];
    };

    var verifyCredentials = function() {
        $('.column.label.auth').show('fast').removeClass('ok error');
        if(Instapaper.Auth.verifyCredentials(ui.username.val(), ui.password.val())) {
            $('.column.label.auth').addClass('ok').text('Your credentials are valid.');
            // getRSSfeed(username, password);
        } else {
            $('.column.label.auth').addClass('error').text('Your username or password is incorrect. Please double check them.');
        }
    };

    var getRSSfeed = function(user, pass) {
       var xhr = new XMLHttpRequest();
       var params='username=' + user + '&password=' + pass;
       xhr.onreadystatechange = function() {
          if(xhr.readyState == 4 &&
                xhr.status == 200) {
             var xhr2 = new XMLHttpRequest();
             xhr2.onreadystatechange = function() {
                if(xhr2.readyState == 4 &&
                      xhr2.status == 200) {
                   $.db('rssfeed',
                         /"(http:\/\/www\.instapaper\.com\/rss\/[^"]*)"/.exec(
                            xhr2.responseText)[1]);
                }
             };
             xhr2.open('GET', 'https://www.instapaper.com/u', true);
             xhr2.send();
          }
       }
       xhr.open('POST', 'https://www.instapaper.com/user/login', true);
       xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
       xhr.send(params);
    };

    ui.username.bind('change', verifyCredentials);
    ui.password.bind('change', verifyCredentials);

    return {
        humanizeKeystrokes: function(e) {
            var key = "",
                special = "";
            if(e.keyCode >= 65 && e.keyCode <= 90) {
                key = String.fromCharCode(e.keyCode);
                if (e.ctrlKey) {
                    special += "Ctrl + ";
                }
                if (e.altKey) {
                    special += "Alt + ";
                }
                if (e.shiftKey) {
                    special += "Shift + ";
                }
            }
            return special + key;
        },

        restore: function() {
            if (location.hash === '#setup') {
                $.flash('Enter your Instapaper credentials in order to save an URL.');
            }
            ui.username.val(dbOrDefault('username'));
            if (dbOrDefault('show_popup') === '1') {
                ui.show_popup.attr('checked', true);
            }
            if (dbOrDefault('auto_close') === '1') {
                ui.auto_close.attr('checked', true);
            }
            if (dbOrDefault('cx_read_later') === '1') {
                ui.cx_read_later.attr('checked', true);
            }
            if (dbOrDefault('cx_text_view') === '1') {
                ui.cx_text_view.attr('checked', true);
            }
            if (dbOrDefault('cx_unread') === '1') {
                ui.cx_unread.attr('checked', true);
            }
            if (dbOrDefault('cx_starred') === '1') {
                ui.cx_starred.attr('checked', true);
            }
            if (dbOrDefault('cx_archive') === '1') {
                ui.cx_archive.attr('checked', true);
            }
            ui.badge_style.val(dbOrDefault('badge_style'));
            ui.shortcut.val(this.humanizeKeystrokes(dbOrDefault('shortcut')))
            .data('keys', dbOrDefault('shortcut'));

            ui.badge_style.change(function () {
                if(parseInt($(this).val()) == 3) {
                    getRSSfeed(ui.username.val(), ui.password.val());
                }
            });
        },

        save: function() {
            if(!$.db('oauth_token') || $.trim(ui.password.val()).length > 0) {
                var accessToken = Instapaper.Auth.getAccessToken(
                    ui.username.val(),
                    ui.password.val()
                );
            } else {
                var accessToken = {
                    oauth_token: $.db('oauth_token'),
                    oauth_token_secret: $.db('oauth_token_secret'),
                    user_id: $.db('user_id'),
                    username: $.db('username'),
                    subscription_is_active: true
                };
            }
            if(accessToken) {
                $.db('oauth_token', accessToken.oauth_token);
                $.db('oauth_token_secret', accessToken.oauth_token_secret);
                $.db('user_id', accessToken.user_id);
                $.db('username', accessToken.username);
                $.db('show_popup', ui.show_popup.is(':checked') ? '1': '0');
                $.db('auto_close', ui.auto_close.is(':checked') ? '1': '0');
                $.db('cx_read_later', ui.cx_read_later.is(':checked') ? '1': '0');
                $.db('cx_text_view', ui.cx_text_view.is(':checked') ? '1': '0');
                $.db('cx_unread', ui.cx_unread.is(':checked') ? '1': '0');
                $.db('cx_starred', ui.cx_starred.is(':checked') ? '1': '0');
                $.db('cx_archive', ui.cx_archive.is(':checked') ? '1': '0');
                $.db('badge_style', ui.badge_style.val());
                $.db('shortcut', ui.shortcut.data('keys'));

                if(accessToken.subscription_is_active) {
                    $.flash('Options saved successfully!');
                } else {
                    $.flash("You don't have a paid subscription at Instapaper. " +
                            "Some features requires to have a paid subscription. " +
                            '<a href="http://blog.instapaper.com/post/3208433429">Read more</a>');
                }
            } else {
                $.flash('There was an error authenticating with Instapaper! Please check your credentials.');
            }
        }
    };
};


$(function() {
    var o = new Options();
    o.restore();

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

