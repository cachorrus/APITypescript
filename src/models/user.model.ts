import { Schema, model } from "mongoose";

let UserSchema: Schema = new Schema({
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
})

export default model("User", UserSchema);