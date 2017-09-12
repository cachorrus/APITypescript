"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var bcrypt = require("bcrypt-nodejs");
var multipart = require("connect-multiparty");
var fs = require("fs");
var path = require("path");
// Modelos
var user_model_1 = require("../models/user.model");
// Servicios
var jwt_service_1 = require("../services/jwt.service");
var auth_service_1 = require("../services/auth.service");
var UserController = (function () {
    function UserController() {
        this.router = express_1.Router();
        this.upload = multipart({ uploadDir: "./uploads/users" });
        this.routes();
    }
    UserController.prototype.login = function (req, res) {
        var params = req.body;
        var username = params.username;
        var password = params.password;
        console.log("Data: ", params);
        var status = res.statusCode;
        var msg = res.statusMessage;
        user_model_1.default.findOne({ username: username.toLowerCase() })
            .then(function (user) {
            // Comparar contraseñas
            bcrypt.compare(password, user['password'], function (err, check) {
                if (check) {
                    if (params.gethash) {
                        res.json({ status: status, msg: msg, ok: true, token: jwt_service_1.default.createToken(user) });
                    }
                    else {
                        res.json({ status: status, msg: msg, ok: true, user: user });
                    }
                }
                else {
                    res.json({ status: status, msg: msg, ok: false, err: "El usuario y/o la contraseña son incorrectos." });
                }
            });
        })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    UserController.prototype.saveUser = function (req, res) {
        var params = req.body;
        // Encriptar contraseña
        bcrypt.hash(params.password, null, null, function (err, encrypt_pass) {
            var name = params.name;
            var surname = params.surname;
            var username = params.username;
            var email = params.email;
            var role = params.role;
            var image = null;
            var password = encrypt_pass;
            var user = new user_model_1.default({
                name: name,
                surname: surname,
                username: username,
                email: email,
                role: role,
                image: image,
                password: password
            });
            var status = res.statusCode;
            var msg = res.statusMessage;
            user.save()
                .then(function (user) { return res.json({ status: status, msg: msg, ok: true, user: user }); })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
            if (err) {
                res.json({ status: status, msg: msg, ok: false, err: "Error al encriptar la contraseña" });
            }
        });
    };
    UserController.prototype.updateUser = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        user_model_1.default.findByIdAndUpdate(Id, req.body)
            .then(function (user) { return res.json({ status: status, msg: msg, ok: true, user: user }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    UserController.prototype.getUsers = function (req, res) {
        var status = res.statusCode;
        var msg = res.statusMessage;
        user_model_1.default.find()
            .then(function (users) { return res.json({ status: status, msg: msg, ok: true, cant: users.length, users: users }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    UserController.prototype.getUser = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        user_model_1.default.findById(Id)
            .then(function (user) { return res.json({ status: status, msg: msg, ok: true, user: user }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    UserController.prototype.deleteUser = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        user_model_1.default.findByIdAndRemove(Id)
            .then(function (UserDeleted) { return res.json({ status: status, msg: msg, ok: true, UserDeleted: UserDeleted }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    // Imagenes
    UserController.prototype.uploadImage = function (req, res) {
        var Id = req.params.Id;
        var path = req['files'].image.path;
        var path_s = path.split("\\");
        var name = path_s[2];
        var name_s = name.split("\.");
        var ext = name_s[1];
        var status = res.statusCode;
        var msg = res.statusMessage;
        if (ext == "png" || ext == "jpg" || ext == "gif") {
            user_model_1.default.findByIdAndUpdate(Id, { image: name })
                .then(function (user) { return res.json({ status: status, msg: msg, ok: true, user: user }); })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
        }
        else {
            res.json({ status: status, msg: msg, ok: false, err: "La extención del archivo debe ser 'jpg', 'png' o 'gif'." });
        }
    };
    UserController.prototype.getImage = function (req, res) {
        var img = "./uploads/users/" + req.params.imgFile;
        var status = res.statusCode;
        var msg = res.statusMessage;
        fs.exists(img, function (exist) {
            if (exist) {
                res.sendfile(path.resolve(img));
            }
            else {
                res.json({ status: status, msg: msg, ok: false, err: "No existe la imagen." });
            }
        });
    };
    UserController.prototype.routes = function () {
        this.router.post("/new", this.saveUser);
        this.router.post("/login", this.login);
        this.router.put("/upload/:Id", [auth_service_1.default.ensureAuth, this.upload], this.uploadImage);
        this.router.put("/update/:Id", auth_service_1.default.ensureAuth, this.updateUser);
        this.router.get("/all", auth_service_1.default.ensureAuth, this.getUsers);
        this.router.get("/:Id", auth_service_1.default.ensureAuth, this.getUser);
        this.router.get("/image/:imgFile", this.getImage);
        this.router.delete("/delete/:Id", auth_service_1.default.ensureAuth, this.deleteUser);
    };
    return UserController;
}());
// Export
var UserRoutes = new UserController();
UserRoutes.routes();
exports.default = UserRoutes.router;
