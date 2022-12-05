"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.AuthRouter = router;
const User_1 = __importDefault(require("../schema/User"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const crypto_js_1 = require("crypto-js");
const jsonwebtoken_1 = require("jsonwebtoken");
const utils_1 = require("../utils/utils");
router.post('/signup', async (req, res) => {
    try {
        const hashPassword = crypto_js_1.AES.encrypt(req.body.password, process.env.HASH_KEY || '').toString();
        const newUser = new User_1.default({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
        });
        await newUser.save();
        res.status(201).json({
            message: 'User Created Successfully',
            status: 'created'
        });
    }
    catch (err) {
        res.status(500).json(err);
    }
});
router.post('/login', async (req, res) => {
    try {
        const user = await User_1.default.findOne({ username: req.body.email });
        if (!user) {
            res.status(401).json({ error: "User not found" });
        }
        else {
            const bytes = crypto_js_1.AES.decrypt(user.password, process.env.HASH_KEY || '');
            const passValidate = bytes.toString(crypto_js_1.enc.Utf8);
            if (!passValidate) {
                res.status(500).json('wrong username or password!');
            }
            const token = generateAccessToken({
                userId: user._id,
                username: user.username,
                email: user.email,
            });
            const refreshToken = generateRefreshToken({
                userId: user._id,
                username: user.username,
                email: user.email,
            });
            res.status(200).json({
                access_token: token,
                refresh_token: refreshToken,
            });
        }
    }
    catch (err) {
        res.status(404).json(err);
    }
});
router.post('/token', async (req, res) => {
    try {
        const refresh_token = req.body.refresh_token;
        (0, jsonwebtoken_1.verify)(refresh_token, process.env.TOKEN_SECRET_REFRESH || '', (err, data) => {
            const token = generateAccessToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            });
            const refreshToken = generateRefreshToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            });
            res.status(200).json({
                access_token: token,
                refresh_token: refreshToken,
            });
        });
    }
    catch (err) {
        res.status(404).json(err);
    }
});
router.post('/create-device-uuid', (req, res) => {
    try {
        const reqBody = req.body;
        if (reqBody.userType == null) {
            res.status(404).json({
                "status": "ERROR",
                "message": "need requred perams userType",
                "code": "400"
            });
        }
        if (reqBody.deviceType == null) {
            res.status(404).json({
                "status": "ERROR",
                "message": "need requred perams deviceType",
                "code": "400"
            });
        }
        if (reqBody.ipAddress == null) {
            res.status(404).json({
                "status": "ERROR",
                "message": "need requred perams ipAddress",
                "code": "400"
            });
        }
        if (reqBody.appInfo == null) {
            res.status(404).json({
                "status": "error",
                "message": "need requred perams appInfo",
                "code": "400"
            });
        }
        const deviceUuId = crypto_js_1.AES.encrypt(JSON.stringify({ reqBody }), process.env.HASH_KEY).toString();
        res.status(200).json({
            "status": "CREATED",
            "message": "device uuid created succesfully ",
            "code": "200",
            "data": {
                deviceUuId
            }
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
});
router.post('/req-otp', (req, res) => {
    try {
        const reqBody = req.body;
        if (reqBody.deviceUuid == null) {
            res.status(404).json({
                "status": "ERROR",
                "message": "need requred perams deviceUuid",
                "code": "400"
            });
        }
        if (reqBody.email == null) {
            res.status(404).json({
                "status": "ERROR",
                "message": "need requred perams email",
                "code": "400"
            });
        }
        const DeviceUuIdBytes = crypto_js_1.AES.decrypt(reqBody.deviceUuid, process.env.HASH_KEY);
        const passValidate = DeviceUuIdBytes.toString(crypto_js_1.enc.Utf8);
        if (!passValidate) {
            res.status(404).json({
                "status": "ERROR",
                "message": "Device UuId is not valid",
                "code": "400"
            });
        }
        sendOtp(reqBody.email).then(() => {
            const response = {
                message: 'Message Send!'
            };
            res.status(200).json(response);
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
});
function generateAccessToken(user) {
    return (0, jsonwebtoken_1.sign)(user, process.env.TOKEN_SECRET || '', { expiresIn: '1m' });
}
function generateRefreshToken(user) {
    return (0, jsonwebtoken_1.sign)(user, process.env.TOKEN_SECRET_REFRESH || '', { expiresIn: '2m' });
}
async function sendOtp(email) {
    const nodemailer = require("nodemailer");
    const otp = (0, utils_1.generateOtp)(5);
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", port: 587, secure: false, auth: {
            user: '17182103210@cse.bubt.edu.bd', pass: process.env.MAIL_PASS
        },
    });
    await transporter.sendMail({
        from: "17182103210@cse.bubt.edu.bd",
        to: email,
        subject: "OTP BLOG SITE",
        text: `Your login OTP IS : ${otp}`,
        html: `Your login OTP IS : ${otp}`,
    });
}
//# sourceMappingURL=auth.route.js.map