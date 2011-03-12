/*
 * This is a simple wrapper for XHR calls.
 * Nothing fancy, only for the needs of this chrome extension
 * and other uses it may serve.
 *
 * Author: Edgar J. Suarez
 * License: MIT
 */
var AjaxRequest = function  (base_uri) {
    this.base_uri = base_uri;

    this.post = function (path, options, callback) {
        return this.request('POST', path, options, callback);
    };

    this.get = function (path, options, callback) {
        return this.request('GET', path, options, callback);
    };

    this.request = function (method, path, options, callback) {
        options = options || {};
        options.async == undefined && (options.async = true);
        var xhr = new XMLHttpRequest(),
            url = this.base_uri + path;

        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4 && xhr.status == 200 && typeof callback == 'function') {
                callback(xhr.responseText);
            }
        };
        if(options.query) {
            url += '?' + this._parseQuery(options.query);
        }
        xhr.open(method, url, options.async);
        this._setHeaders(xhr, options.headers);
        xhr.send(options.body);
        return xhr;
    };

    this._parseQuery = function (query) {
        return (query.constructor.name == 'Object' ? $.param(query) : query);
    };

    this._setHeaders = function (xhr, headers) {
        if(headers && headers.constructor.name == 'Object') {
            for (var header in headers) {
                if(headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }
        }
    };
};
