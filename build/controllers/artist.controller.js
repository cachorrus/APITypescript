"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multipart = require("connect-multiparty");
var fs = require("fs");
var path = require("path");
// Modelos
var artist_model_1 = require("../models/artist.model");
var album_model_1 = require("../models/album.model");
var song_model_1 = require("../models/song.model");
// Servicios
var auth_service_1 = require("../services/auth.service");
var ArtistController = (function () {
    function ArtistController() {
        this.router = express_1.Router();
        this.upload = multipart({ uploadDir: "./uploads/artists" });
        this.routes();
    }
    ArtistController.prototype.saveArtist = function (req, res) {
        var params = req.body;
        var name = params.name;
        var description = params.description;
        var image = null;
        var artist = new artist_model_1.default({
            name: name,
            description: description,
            image: image
        });
        var status = res.statusCode;
        var msg = res.statusMessage;
        artist.save()
            .then(function (artist) { return res.json({ status: status, msg: msg, ok: true, artist: artist }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    ArtistController.prototype.updateArtist = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        artist_model_1.default.findByIdAndUpdate(Id, req.body)
            .then(function (artist) { return res.json({ status: status, msg: msg, ok: true, artist: artist }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    ArtistController.prototype.getArtistsPag = function (req, res) {
        var options = {
            sort: { 'name': 1 },
            page: parseInt(req.params.page),
            limit: parseInt(req.params.itemPage)
        };
        var status = res.statusCode;
        var msg = res.statusMessage;
        artist_model_1.default.paginate({}, options, function (err, artists) {
            if (err) {
                res.json({ status: status, msg: msg, ok: false, err: err });
            }
            else {
                res.json({ status: status, msg: msg, ok: true, artists: artists });
            }
        });
    };
    ArtistController.prototype.getArtists = function (req, res) {
        var status = res.statusCode;
        var msg = res.statusMessage;
        artist_model_1.default.find()
            .then(function (artists) { return res.json({ status: status, msg: msg, ok: true, total: artists.length, artists: artists }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    ArtistController.prototype.getArtist = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        artist_model_1.default.findById(Id)
            .then(function (artist) { return res.json({ status: status, msg: msg, ok: true, artist: artist }); })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    ArtistController.prototype.deleteArtist = function (req, res) {
        var Id = req.params.Id;
        var status = res.statusCode;
        var msg = res.statusMessage;
        artist_model_1.default.findByIdAndRemove(Id)
            .then(function (ArtistDeleted) {
            res.json({ status: status, msg: msg, ok: true, ArtistDeleted: ArtistDeleted });
            // Eliminar albunes del artista
            album_model_1.default.find({ artist: ArtistDeleted['_id'] }).remove()
                .then(function (AlbumDeleted) {
                res.json({ status: status, msg: msg, ok: true, AlbumDeleted: AlbumDeleted });
                // Eliminar canciones del album eliminado
                song_model_1.default.find({ album: AlbumDeleted['_id'] }).remove()
                    .then(function (SongDeleted) { return res.json({ status: status, msg: msg, ok: true, SongDeleted: SongDeleted }); })
                    .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
            })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
        })
            .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
    };
    // Imagenes
    ArtistController.prototype.uploadImage = function (req, res) {
        var Id = req.params.Id;
        var path = req['files'].image.path;
        var path_s = path.split("\\");
        var name = path_s[2];
        var name_s = name.split("\.");
        var ext = name_s[1];
        var status = res.statusCode;
        var msg = res.statusMessage;
        if (ext == "png" || ext == "jpg" || ext == "gif") {
            artist_model_1.default.findByIdAndUpdate(Id, { image: name })
                .then(function (artist) { return res.json({ status: status, msg: msg, ok: true, artist: artist }); })
                .catch(function (err) { return res.json({ status: status, msg: msg, ok: false, err: err }); });
        }
        else {
            res.json({ status: status, msg: msg, ok: false, err: "La extención del archivo debe ser 'jpg', 'png' o 'gif'." });
        }
    };
    ArtistController.prototype.getImage = function (req, res) {
        var img = "./uploads/artists/" + req.params.imgFile;
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
    ArtistController.prototype.routes = function () {
        this.router.post("/new", auth_service_1.default.ensureAuth, this.saveArtist);
        this.router.put("/upload/:Id", [auth_service_1.default.ensureAuth, this.upload], this.uploadImage);
        this.router.put("/update/:Id", auth_service_1.default.ensureAuth, this.updateArtist);
        this.router.get("/all", auth_service_1.default.ensureAuth, this.getArtists);
        this.router.get("/pag/:itemPage/:page", auth_service_1.default.ensureAuth, this.getArtistsPag);
        this.router.get("/:Id", auth_service_1.default.ensureAuth, this.getArtist);
        this.router.get("/image/:imgFile", this.getImage);
        this.router.delete("/delete/:Id", auth_service_1.default.ensureAuth, this.deleteArtist);
    };
    return ArtistController;
}());
// Export
var ArtistRoutes = new ArtistController();
ArtistRoutes.routes();
exports.default = ArtistRoutes.router;
