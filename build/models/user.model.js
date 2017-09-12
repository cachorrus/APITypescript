"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        default: null,
        required: true
    },
    surname: {
        type: String,
        default: null,
        required: true
    },
    username: {
        type: String,
        default: null,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        default: null,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        default: null,
        required: true
    },
    role: {
        type: Number,
        default: 0,
        required: true
    },
    image: String
});
exports.default = mongoose_1.model("User", UserSchema);
