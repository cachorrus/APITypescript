"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var SongSchema = new mongoose_1.Schema({
    number: {
        type: Number,
        default: null,
        required: true
    },
    name: {
        type: String,
        default: null,
        required: true,
        unique: true
    },
    duration: {
        type: String,
        default: null,
        required: true
    },
    file: String,
    album: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Album'
    }
});
exports.default = mongoose_1.model("Song", SongSchema);
