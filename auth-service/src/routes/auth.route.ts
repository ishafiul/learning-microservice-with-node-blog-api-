import {Router} from "express";
import User from "../schema/User";
import {config} from "dotenv";
import {AES, enc,} from "crypto-js";


import {verify} from 'jsonwebtoken';
import {Device, OtpReq, OtpVerify, RefreshToken} from "../data/auth_types";
import {addMinutesToDate, generateOtp, getUsername, isDateExpired, saveToken, sendOtp} from "../utils/utils";
import OtpSchema from "../schema/Otp";
import {HttpStatus, UserType} from "../data/auth_enums";

const router = Router();

config();


router.post('/create-device-uuid', (req: { body: Device; }, res: any) => {
    try {
        const reqBody: Device = req.body
        const deviceUuId = AES.encrypt(JSON.stringify({reqBody}), process.env.HASH_KEY!).toString();
        res.status(200).json({
            "status": HttpStatus.CREATED,
            "message": "device uuid created successfully ",
            "code": "200",
            "data": {
                deviceUuId
            }
        });


    } catch (err) {
        res.status(400).json(err);
    }

})


router.post('/req-otp', async (req: { body: OtpReq }, res: any) => {
    try {
        const reqBody: OtpReq = req.body
        const user = await User.findOne({email: reqBody.email});
        const oldOtp = await OtpSchema.findOne({email: reqBody.email, isExpired: false});

        const DeviceUuIdBytes = AES.decrypt(reqBody.deviceUuid, process.env.HASH_KEY!);
        const isDeviceUuId = DeviceUuIdBytes.toString(enc.Utf8);

        if (oldOtp) {
            await OtpSchema.updateMany({email: reqBody.email, isExpired: false}, {$set: {isExpired: true}}, {
                returnOriginal: false
            })
        }
        if (!isDeviceUuId) {
            res.status(404).json({
                "status": HttpStatus.ERROR,
                "message": "Device UuId is not valid",
                "code": "400"
            });
        } else {
            if (!user) {
                const otpCode = generateOtp(5)
                sendOtp(reqBody.email, otpCode).then(async () => {

                    const newOtp = new OtpSchema({
                        otp: otpCode,
                        email: reqBody.email,
                        isExpired: false,
                        deviceUuId: reqBody.deviceUuid,
                        expiredAt: addMinutesToDate(new Date(), 5).toISOString()
                    })
                    await newOtp.save();

                    res.status(200).json({
                        "status": HttpStatus.SUCCESS,
                        "message": `OTP send to ${reqBody.email} `,
                        "code": "200"
                    });
                })
            } else {
                const otpCode = generateOtp(5)

                sendOtp(reqBody.email, otpCode).then(async () => {

                    const newOtp = new OtpSchema({
                        otp: otpCode,
                        email: reqBody.email,
                        isExpired: false,
                        deviceUuId: reqBody.deviceUuid,
                        userId: user._id,
                        expiredAt: addMinutesToDate(new Date(), 5).toISOString()
                    })
                    await newOtp.save();

                    res.status(200).json({
                        "status": HttpStatus.SUCCESS,
                        "message": `OTP send to ${reqBody.email} `,
                        "code": "200"
                    });
                })
            }
        }
    } catch (err) {
        res.status(400).json(err);
    }
})

router.post('/verify-otp', async (req: { body: OtpVerify }, res: any) => {
    try {
        const reqBody: OtpVerify = req.body
        const otpRes = await OtpSchema.findOne({
            email: reqBody.email,
            deviceUuId: reqBody.deviceUuid,
            isExpired: false
        });
        if (!otpRes) {
            res.status(404).json({
                "status": HttpStatus.ERROR,
                "message": `no valid otp found for this email and device id`,
                "code": "404"
            });

        } else {
            if (isDateExpired(otpRes.expiredAt)) {
                await OtpSchema.updateMany({
                    deviceUuId: reqBody.deviceUuid,
                    email: reqBody.email
                }, {isExpired: true}, {
                    returnOriginal: false
                })
                res.status(400).json({
                    "status": HttpStatus.ERROR,
                    "message": `OTP expired`,
                    "code": "400"
                });
            } else {
                if (otpRes.otp === reqBody.otp) {
                    if (!otpRes.userId) {
                        const newUser = new User({
                            userName: getUsername(req.body.email),
                            email: req.body.email,
                            userType: UserType.USER,
                        })
                        await newUser.save();
                        const user = await User.findOne({email: reqBody.email});
                        if (user) {
                            await OtpSchema.updateMany({
                                email: otpRes.email,
                            }, {isExpired: true}, {
                                returnOriginal: false
                            })
                            const tokenSaveRes = await saveToken({
                                userId: user._id.toString(),
                                email: otpRes.email,
                                deviceUuId: reqBody.deviceUuid,
                            })
                            if (tokenSaveRes) {
                                res.status(tokenSaveRes.code).json(tokenSaveRes);
                            }
                        }
                    } else {
                        await OtpSchema.updateMany({
                            email: otpRes.email,
                        }, {isExpired: true}, {
                            returnOriginal: false
                        })
                        const tokenSaveRes = await saveToken({
                            userId: otpRes.userId,
                            email: otpRes.email,
                            deviceUuId: reqBody.deviceUuid,
                        })
                        if (tokenSaveRes) {
                            res.status(tokenSaveRes.code).json(tokenSaveRes);
                        }
                    }

                } else {
                    res.status(400).json({
                        "status": HttpStatus.ERROR,
                        "message": `OTP did not match`,
                        "code": "400"
                    });
                }
            }
        }
    } catch (err) {
        res.status(400).json(err);
    }
})

router.post('/refresh-token', async (req: { body: RefreshToken; }, res) => {
    try {
        const refreshToken = req.body.refreshToken
        verify(refreshToken, process.env.TOKEN_SECRET_REFRESH || '', async (err: any, data: any) => {
            const tokenSaveRes = await saveToken({
                userId: data.userId,
                email: data.email,
                deviceUuId: req.body.deviceUuId
            })
            if (tokenSaveRes) {
                res.status(tokenSaveRes.code).json(tokenSaveRes);
            }
        })
    } catch (err) {
        res.status(404).json(err);
    }
})

export {router as AuthRouter};