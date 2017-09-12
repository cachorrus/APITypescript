import { Schema, model } from "mongoose";
import * as mongoosePagination from "mongoose-paginate";

let ArtistSchema: Schema = new Schema({
    name: {
        type: String,
        default: null,
        required: true,
        unique: true
    },
    description: String,
    image: String
})

ArtistSchema.plugin(mongoosePagination);
export default model("Artist", ArtistSchema);