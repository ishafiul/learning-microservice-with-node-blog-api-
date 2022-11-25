"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const router = require("express").Router();
exports.AuthRouter = router;
const User_1 = __importDefault(require("../schema/User"));
require("dotenv").config();
const crypto_js_1 = __importDefault(require("crypto-js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//register
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashPassword = crypto_js_1.default.AES.encrypt(req.body.password, process.env.HASH_KEY || '').toString();
        const newUser = new User_1.default({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
        });
        const user = yield newUser.save();
        //const token = jwt.sign(user, process.env.TOKEN_SECRET)
        res.status(201).json({
            message: 'User Created Successfully',
            status: 'created'
        });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
//login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ username: req.body.email });
        if (!user) {
            res.status(401).json({ error: "User not found" });
        }
        else {
            const bytes = crypto_js_1.default.AES.decrypt(user.password, process.env.HASH_KEY || '');
            const passValidate = bytes.toString(crypto_js_1.default.enc.Utf8);
            if (!passValidate) {
                res.status(500).json('wrong username or password!');
            }
            const token = generetAccessToken({
                userId: user._id,
                username: user.username,
                email: user.email,
            });
            const refresh_token = generetRefreshToken({
                userId: user._id,
                username: user.username,
                email: user.email,
            });
            res.status(200).json({
                access_token: token,
                refresh_token: refresh_token,
            });
        }
    }
    catch (err) {
        res.status(404).json(err);
    }
}));
//token
router.post('/token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.body.refresh_token;
        jsonwebtoken_1.default.verify(refresh_token, process.env.TOKEN_SECRET_REFRESH || '', (err, data) => {
            const token = generetAccessToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            });
            const refresh_token = generetRefreshToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            });
            //const refresh_token_new = jwt.sign(data, process.env.TOKEN_SECRET_REFRESH)
            res.status(200).json({
                access_token: token,
                refresh_token: refresh_token,
            });
        });
    }
    catch (err) {
        res.status(404).json(err);
    }
}));
router.post('/createDeviceUuid', (req, res) => {
    try {
        console.log(req.body);
    }
    catch (err) {
        res.status(404).json(err);
    }
});
//generet token
function generetAccessToken(user) {
    return jsonwebtoken_1.default.sign(user, process.env.TOKEN_SECRET || '', { expiresIn: '1m' });
}
function generetRefreshToken(user) {
    return jsonwebtoken_1.default.sign(user, process.env.TOKEN_SECRET_REFRESH || '', { expiresIn: '2m' });
}
