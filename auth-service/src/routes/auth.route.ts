import {Router} from "express";

const router = Router();
import User from "../schema/User";
import {config} from "dotenv";
config();
import CryptoJS from "crypto-js";


import jwt from 'jsonwebtoken';
import {Device, OtpReq} from "../data/auth_types.d.";
import {generateOtp} from "../utils/utils";
// register


router.post('/signup', async (req, res) => {
    try {
        const hashPassword = CryptoJS.AES.encrypt(req.body.password, process.env.HASH_KEY || '').toString();
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
        })
        await newUser.save();
        // const token = jwt.sign(user, process.env.TOKEN_SECRET)
        res.status(201).json({
            message: 'User Created Successfully',
            status: 'created'
        });
    } catch (err) {
        res.status(500).json(err);
    }
})

// login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.email});
        if (!user) {
            res.status(401).json({error: "User not found"});
        } else {
            const bytes = CryptoJS.AES.decrypt(user.password, process.env.HASH_KEY || '');
            const passValidate = bytes.toString(CryptoJS.enc.Utf8);
            if (!passValidate) {
                res.status(500).json('wrong username or password!');
            }

            const token = generateAccessToken({
                userId: user._id,
                username: user.username,
                email: user.email,
            })
            const refreshToken = generateRefreshToken({
                userId: user._id,
                username: user.username,
                email: user.email,
            })
            res.status(200).json({
                access_token: token,
                refresh_token: refreshToken,
            });
        }
    } catch (err) {
        res.status(404).json(err);
    }
})

// token

router.post('/token', async (req, res) => {
    try {
        const refresh_token = req.body.refresh_token
        jwt.verify(refresh_token, process.env.TOKEN_SECRET_REFRESH || '', (err: any, data: any) => {
            const token = generateAccessToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            })
            const refreshToken = generateRefreshToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            })
            // const refresh_token_new = jwt.sign(data, process.env.TOKEN_SECRET_REFRESH)
            res.status(200).json({
                access_token: token,
                refresh_token: refreshToken,
            });
        })
    } catch (err) {
        res.status(404).json(err);
    }
})


router.post('/create-device-uuid', (req: { body: Device; }, res: any) => {
    try {
        const reqBody: Device = req.body
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
        const deviceUuId = CryptoJS.AES.encrypt(JSON.stringify({reqBody}), process.env.HASH_KEY!).toString();
        res.status(200).json({
            "status": "CREATED",
            "message": "device uuid created succesfully ",
            "code": "200",
            "data": {
                deviceUuId
            }
        });


    } catch (err) {
        res.status(400).json(err);
    }

})


router.post('/req-otp', (req: { body: OtpReq }, res: any) => {
    try {
        const reqBody: OtpReq = req.body
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
        const DeviceUuIdBytes = CryptoJS.AES.decrypt(reqBody.deviceUuid, process.env.HASH_KEY!);
        const passValidate = DeviceUuIdBytes.toString(CryptoJS.enc.Utf8);

        if (!passValidate){
            res.status(404).json({
                "status": "ERROR",
                "message": "Device UuId is not valid",
                "code": "400"
            });
        }


        const nodemailer = require("nodemailer");
        const otp = generateOtp(5)

        async function main() {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com", port: 587, secure: false, auth: {
                    user: '17182103210@cse.bubt.edu.bd', pass: process.env.MAIL_PASS
                },
            });
            await transporter.sendMail({
                from: "17182103210@cse.bubt.edu.bd",
                to: reqBody.email,
                subject: "OTP BLOG SITE",
                text: `Your login OTP IS : ${otp}`,
                html: `Your login OTP IS : ${otp}`,
            });
        }

        main().then(() => {
            const response = {
                message: 'Message Send!'
            }
            res.status(200).json(response);
        })

    } catch (err) {
        res.status(400).json(err);
    }
})


function generateAccessToken(user: string | object) {
    return jwt.sign(user, process.env.TOKEN_SECRET || '', {expiresIn: '1m'})
}

function generateRefreshToken(user: string | object | Buffer) {
    return jwt.sign(user, process.env.TOKEN_SECRET_REFRESH || '', {expiresIn: '2m'})
}

export {router as AuthRouter};