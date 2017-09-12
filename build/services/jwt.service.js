"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jwt-simple");
var moment = require("moment");
var TokenService = (function () {
    function TokenService() {
    }
    TokenService.prototype.createToken = function (user) {
        var secret_key = "key_secret";
        var payload = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            image: user.image,
            iat: moment().unix(),
            exp: moment().add(30, 'days').unix
        };
        return jwt.encode(payload, secret_key);
    };
    return TokenService;
}());
// Export
var token = new TokenService();
exports.default = token;
