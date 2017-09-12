"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var mongoose = require("mongoose");
var bodyParse = require("body-parser");
var compression = require("compression");
var logger = require("morgan");
var helmet = require("helmet");
var cors = require("cors");
// Importar Controllers
var user_controller_1 = require("./controllers/user.controller");
var artist_controller_1 = require("./controllers/artist.controller");
var album_controller_1 = require("./controllers/album.controller");
var song_controller_1 = require("./controllers/song.controller");
// Servicio class
var Server = (function () {
    function Server() {
        this.app = express();
        this.config();
        this.routes();
    }
    Server.prototype.config = function () {
        // Conectar MongoDB
        var MONGO_URI = "mongodb://localhost/curso";
        mongoose.connect(process.env.MONGODB_URI || MONGO_URI);
        // Configuraciones
        this.app.use(bodyParse.urlencoded({ extended: true }));
        this.app.use(bodyParse.json());
        this.app.use(helmet());
        this.app.use(logger('dev'));
        this.app.use(compression());
        this.app.use(cors());
    };
    Server.prototype.routes = function () {
        var router;
        router = express.Router();
        this.app.use("/", router);
        this.app.use("/api/v1/user", user_controller_1.default);
        this.app.use("/api/v1/artist", artist_controller_1.default);
        this.app.use("/api/v1/album", album_controller_1.default);
        this.app.use("/api/v1/song", song_controller_1.default);
    };
    return Server;
}());
exports.default = new Server().app;
