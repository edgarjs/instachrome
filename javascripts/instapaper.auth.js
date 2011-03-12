Instapaper.Auth = new function (){
    var consumerKey = 'kNfh6BSVMURjOGrYN7a0jdIyPxOwqujdtJpvC5ub6Ov74YNcic',
        consumerSecret = 'KxjIrl2Lgo6yzo2WEqGqOkzttEsEf4tiido5eF85VGIwRVyuKo';

    var getUserInfo = function (username, password) {
        var xhr = Instapaper.Api.get('/account/verify_credentials', {
            async: false,
            query: {
                username: username,
                password: password
            }
        });
        return JSON.parse(xhr.responseText)[0];
    };

    var verifyCredentials = function (username, password) {
        return getUserInfo(username, password).type == 'user';
    };

    var getAccessToken = function (username, password) {
        var userInfo = getUserInfo(username, password);
        if(userInfo.type != 'user') {
            return userInfo.message;
        }

        var url = 'https://www.instapaper.com/api/1/oauth/access_token',
            accessor = {
                consumerKey: consumerKey,
                consumerSecret: consumerSecret
            },
            parameters = {
                x_auth_username: username,
                x_auth_password: password,
                x_auth_mode: 'client_auth'
            },
            message = {
                action: url,
                method: 'POST',
                parameters: $.extend({}, parameters)
            };
        OAuth.completeRequest(message, accessor);

        var xhr = Instapaper.Api.post('/oauth/access_token', {
            async: false,
            body: OAuth.formEncode(parameters),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': OAuth.getAuthorizationHeader(url, message.parameters)
            }
        });
        if(xhr.status == 200) {
            var response = xhr.responseText.split('&'),
                data = {};
            for (var i = 0; i < response.length; i++) {
                var param = response[i].split('=');
                data[param[0]] = param[1];
            }
            data.user_id = userInfo.user_id;
            data.username = userInfo.username;
            data.subscription_is_active = userInfo.subscription_is_active == '1';
            return data;
        } else {
            throw("Invalid response. Code: " + xhr.status);
        }
    };

    return {
        verifyCredentials: verifyCredentials,
        getAccessToken: getAccessToken
    };
};
