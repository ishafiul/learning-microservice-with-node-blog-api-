import {model, Schema} from "mongoose";


const Otp = new Schema({
    otp: {
        type: String,
        required: true,
    },
    deviceUuId: {
        type: String,
        required: true,
        unique: true
    },
    isExpired: {
        type: Boolean,
        required: true,
    },
    expiredAt: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    }
}, {timestamps: true});

export default model("Otp", Otp);