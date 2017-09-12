"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var AlbumSchema = new mongoose_1.Schema({
    title: {
        type: String,
        default: null,
        required: true,
        unique: true
    },
    description: String,
    year: Number,
    image: String,
    artist: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Artist'
    }
});
exports.default = mongoose_1.model("Album", AlbumSchema);
