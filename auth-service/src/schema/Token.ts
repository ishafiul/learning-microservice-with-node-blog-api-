import {model, Schema} from "mongoose";


const Token = new Schema({
    userId: {
        type: String,
        required: true,
    },
    deviceUuId: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    isExpired: {
        type: Boolean,
        required: true,
    },
}, {timestamps: true});

export default model("Token", Token);