import { Schema, model } from "mongoose";

let AlbumSchema: Schema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'Artist'
    }
})

export default model("Album", AlbumSchema);