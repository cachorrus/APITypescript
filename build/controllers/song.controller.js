"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multipart = require("connect-multiparty");
var fs = require("fs");
var path = require("path");
// Modelos
var song_model_1 = require("../models/song.model");
// Servicios
var auth_service_1 = require("../services/auth.service");
var SongController = (function () {
    function SongController() {
        this.router = express_1.Router();
        this.upload = multipart({ uploadDir: "./uploads/songs" });
        this.routes();
    }
    SongController.prototype.saveSong = function (req, res) {
        var params = req.body;
        var number = params.number;
        var name = params.name;
        var duration = params.duration;
        var album = params.album;
        var file = null;
        var song = new song_model_1.default({
            number: number,
            name: name,
            duration: duration,
            album: album,
            file: file
        });
        var status = res.statusCode;
        var msg = res.statusMessage;
        song.save()
            .then(function (song) { return res.json({ status: status, msg: msg, ok: true, song: song }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    SongController.prototype.updateSong = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        song_model_1.default.findByIdAndUpdate(Id, req.body)
            .then(function (song) { return res.json({ status: status, msg: msg, ok: true, song: song }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    SongController.prototype.getSongs = function (req, res) {
        var params = (req.params.IdAlbum ? { album: req.params.IdAlbum } : null);
        var order = (req.params.IdArtist ? "number" : "name");
        var status = res.statusCode;
        var msg = res.statusMessage;
        song_model_1.default.find(params).sort(order).populate("album", "title description year image")
            .then(function (songs) { return res.json({ status: status, msg: msg, ok: true, total: songs.length, songs: songs }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    SongController.prototype.getSong = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        song_model_1.default.findById(Id).populate("album", "title description year image")
            .then(function (song) { return res.json({ status: status, msg: msg, ok: true, song: song }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    SongController.prototype.deleteSong = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        song_model_1.default.findByIdAndRemove(Id)
            .then(function (SongDeleted) { return res.json({ status: status, msg: msg, ok: true, SongDeleted: SongDeleted }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    // Canciones
    SongController.prototype.uploadFile = function (req, res) {
        var Id = req.params.Id;
        var path = req['files'].file.path;
        var path_s = path.split("\\");
        var name = path_s[2];
        var name_s = name.split("\.");
        var ext = name_s[1];
        var status = res.statusCode;
        var msg = res.statusMessage;
        if (ext == "mp3" || ext == "ogg") {
            song_model_1.default.findByIdAndUpdate(Id, { file: name })
                .then(function (user) { return res.json({ status: status, msg: msg, ok: true, user: user }); })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
        }
        else {
            res.json({ status: status, msg: msg, ok: false, err: "La extención del archivo debe ser 'mp3' o 'ogg'." });
        }
    };
    SongController.prototype.getFile = function (req, res) {
        var file = "./uploads/songs/" + req.params.fileSong;
        var status = res.statusCode;
        var msg = res.statusMessage;
        fs.exists(file, function (exist) {
            if (exist) {
                res.sendfile(path.resolve(file));
            }
            else {
                res.json({ status: status, msg: msg, ok: false, err: "No existe el fichero de audio." });
            }
        });
    };
    SongController.prototype.routes = function () {
        this.router.post("/new", auth_service_1.default.ensureAuth, this.saveSong);
        this.router.put("/upload/:Id", [auth_service_1.default.ensureAuth, this.upload], this.uploadFile);
        this.router.put("/update/:Id", auth_service_1.default.ensureAuth, this.updateSong);
        this.router.get("/all/:IdAlbum?", auth_service_1.default.ensureAuth, this.getSongs);
        this.router.get("/:Id", auth_service_1.default.ensureAuth, this.getSong);
        this.router.get("/file/:fileSong", this.getFile);
        this.router.delete("/delete/:Id", auth_service_1.default.ensureAuth, this.deleteSong);
    };
    return SongController;
}());
// Export
var SongRoutes = new SongController();
SongRoutes.routes();
exports.default = SongRoutes.router;
