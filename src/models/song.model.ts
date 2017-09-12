import { Schema, model } from "mongoose";

let SongSchema: Schema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'Album'
    }
})

export default model("Song", SongSchema);