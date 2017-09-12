"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jwt-simple");
var moment = require("moment");
var AuthService = (function () {
    function AuthService() {
    }
    AuthService.prototype.ensureAuth = function (req, res, next) {
        var auth = req.headers.authorization;
        var secret_key = "key_secret";
        var user;
        if (!auth) {
            var status_1 = res.statusCode;
            return res.json({ status: status_1, ok: false, err: "La petición no tiene la cabecera de 'Authorization'." });
        }
        else {
            var token = auth.replace(/['"]+/g, '');
            try {
                user = jwt.decode(token, secret_key);
                if (user.exp <= moment().unix()) {
                    var status_2 = res.statusCode;
                    return res.json({ status: status_2, ok: false, err: "El token ha expirado." });
                }
            }
            catch (err) {
                var status_3 = res.statusCode;
                return res.json({ status: status_3, ok: false, err: "Token invalido." });
            }
        }
        req['user'] = user;
        next();
    };
    return AuthService;
}());
// Export
var auth = new AuthService();
exports.default = auth;
