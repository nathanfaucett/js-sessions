var isString = require("is_string"),
    isObject = require("is_object"),
    isFunction = require("is_function"),
    Cookie = require("cookie"),
    crypto = require('crypto'),
    MemoryStore = require("./MemoryStore");


function Sessions(opts) {
    opts || (opts = {});

    this.name = isString(opts.name) ? opts.name : "sid";
    this.store = isObject(opts.store) ? opts.store : new MemoryStore();
    this.secret = isString(opts.secret) ? opts.secret : "sessions";
    this.generateID = isFunction(opts.generateID) ? opts.generateID : uid;
}

Sessions.prototype.middleware = function(req, res, next) {
    var cookie = req.cookie(this.name),
        store = this.store,
        sessionId, value;

    if (cookie) {
        value = cookie.value;

        if (value.substr(0, 2) === "s:") {
            sessionId = unsign(value.slice(2), this.secret);
        }
    } else {
        sessionId = this.generateID();
        value = "s:" + sign(sessionId, this.secret);

        cookie = new Cookie(this.name, value);
        res.setCookie(cookie);
    }

    store.get(sessionId, function(err, session) {
        var nativeEnd = res.end;

        if (err) {
            session = {
                cookie: cookie
            };
        }

        req.session = session;

        res.end = function(data, encoding) {
            store.set(sessionId, session, function(err) {
                if (err) {
                    throw err;
                }

                nativeEnd.call(res, data, encoding);
            });
        };

        next();
    });
};

function sign(val, secret) {
    if (!isString(val)) {
        throw new TypeError("cookie required");
    }
    if (!isString(secret)) {
        throw new TypeError("secret required");
    }

    return val + "." + crypto.createHmac("sha256", secret).update(val).digest("base64").replace(sign.reReplacer, "");
}
sign.reReplacer = /\=+$/;

function unsign(val, secret) {
    var str, mac;

    if (!isString(val)) {
        throw new TypeError("cookie required");
    }
    if (!isString(secret)) {
        throw new TypeError("secret required");
    }

    str = val.slice(0, val.lastIndexOf("."));
    mac = sign(str, secret);

    return sha1(mac) === sha1(val) ? str : false;
}

function sha1(str) {
    return crypto.createHash("sha1").update(str).digest("hex");
}

var UID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function uid(length) {
    var str = "";
    length || (length = 32);
    while (length--) {
        str += UID_CHARS[(Math.random() * 62) | 0];
    }
    return str;
}


module.exports = Sessions;
