import {model, Schema} from "mongoose";


const Token = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    deviceUuId: {
        type: String,
        required: true,
        unique: true
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    }
}, {timestamps: true});

export default model("Token", Token);