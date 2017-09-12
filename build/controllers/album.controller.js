"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multipart = require("connect-multiparty");
var fs = require("fs");
var path = require("path");
// Modelos
var album_model_1 = require("../models/album.model");
var song_model_1 = require("../models/song.model");
// Servicios
var auth_service_1 = require("../services/auth.service");
var AlbumController = (function () {
    function AlbumController() {
        this.router = express_1.Router();
        this.upload = multipart({ uploadDir: "./uploads/albums" });
        this.routes();
    }
    AlbumController.prototype.saveAlbum = function (req, res) {
        var params = req.body;
        var title = params.title;
        var description = params.description;
        var year = params.year;
        var artist = params.artist;
        var image = null;
        var album = new album_model_1.default({
            title: title,
            description: description,
            year: year,
            artist: artist,
            image: image
        });
        var status = res.statusCode;
        var msg = res.statusMessage;
        album.save()
            .then(function (album) { return res.json({ status: status, msg: msg, ok: true, album: album }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    AlbumController.prototype.updateAlbum = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        album_model_1.default.findByIdAndUpdate(Id, req.body)
            .then(function (album) { return res.json({ status: status, msg: msg, ok: true, album: album }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    AlbumController.prototype.getAlbums = function (req, res) {
        var params = (req.params.IdArtist ? { artist: req.params.IdArtist } : null);
        var order = (req.params.IdArtist ? "year" : "title");
        var status = res.statusCode;
        var msg = res.statusMessage;
        album_model_1.default.find(params).sort(order).populate("artist", "name image")
            .then(function (albums) { return res.json({ status: status, msg: msg, ok: true, total: albums.length, albums: albums }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    AlbumController.prototype.getAlbum = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        album_model_1.default.findById(Id).populate("artist", "name description image")
            .then(function (album) { return res.json({ status: status, msg: msg, ok: true, album: album }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    AlbumController.prototype.deleteAlbum = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        album_model_1.default.findByIdAndRemove(Id)
            .then(function (AlbumDeleted) {
            res.json({ status: status, msg: msg, ok: true, AlbumDeleted: AlbumDeleted });
            // Eliminar canciones del album eliminado
            song_model_1.default.find({ album: AlbumDeleted['_id'] }).remove()
                .then(function (SongDeleted) { return res.json({ status: status, msg: msg, ok: true, SongDeleted: SongDeleted }); })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
        })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    // Imagenes
    AlbumController.prototype.uploadImage = function (req, res) {
        var Id = req.params.Id;
        var path = req['files'].image.path;
        var path_s = path.split("\\");
        var name = path_s[2];
        var name_s = name.split("\.");
        var ext = name_s[1];
        var status = res.statusCode;
        var msg = res.statusMessage;
        if (ext == "png" || ext == "jpg" || ext == "gif") {
            album_model_1.default.findByIdAndUpdate(Id, { image: name })
                .then(function (album) { return res.json({ status: status, msg: msg, ok: true, album: album }); })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
        }
        else {
            res.json({ status: status, msg: msg, ok: false, err: "La extención del archivo debe ser 'jpg', 'png' o 'gif'." });
        }
    };
    AlbumController.prototype.getImage = function (req, res) {
        var img = "./uploads/albums/" + req.params.imgFile;
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
    AlbumController.prototype.routes = function () {
        this.router.post("/new", auth_service_1.default.ensureAuth, this.saveAlbum);
        this.router.put("/upload/:Id", [auth_service_1.default.ensureAuth, this.upload], this.uploadImage);
        this.router.put("/update/:Id", auth_service_1.default.ensureAuth, this.updateAlbum);
        this.router.get("/all/:IdArtist?", auth_service_1.default.ensureAuth, this.getAlbums);
        this.router.get("/:Id", auth_service_1.default.ensureAuth, this.getAlbum);
        this.router.get("/image/:imgFile", this.getImage);
        this.router.delete("/delete/:Id", auth_service_1.default.ensureAuth, this.deleteAlbum);
    };
    return AlbumController;
}());
// Export
var AlbumRoutes = new AlbumController();
AlbumRoutes.routes();
exports.default = AlbumRoutes.router;
