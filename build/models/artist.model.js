"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var mongoosePagination = require("mongoose-paginate");
var ArtistSchema = new mongoose_1.Schema({
    name: {
        type: String,
        default: null,
        required: true,
        unique: true
    },
    description: String,
    image: String
});
ArtistSchema.plugin(mongoosePagination);
exports.default = mongoose_1.model("Artist", ArtistSchema);
