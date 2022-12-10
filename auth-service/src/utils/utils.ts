import {sign} from "jsonwebtoken";
import Token from "../schema/Token";
import {HttpRes, TokenData} from "../data/auth_types";
import {HttpStatus} from "../data/auth_enums";

export const generateOtp = (size: number) => {
    const zeros = '0'.repeat(size - 1);
    const x = parseFloat('1' + zeros);
    const y = parseFloat('9' + zeros);
    return String(Math.floor(x + Math.random() * y));
}

export function addMinutesToDate(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function generateAccessToken(user: string | object) {
    return sign(user, process.env.TOKEN_SECRET || '', {expiresIn: '1m'})
}

export function generateRefreshToken(user: string | object | Buffer) {
    return sign(user, process.env.TOKEN_SECRET_REFRESH || '', {expiresIn: '2m'})
}

export async function sendOtp(email: string, otp: string) {
    const nodemailer = require("nodemailer");

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


export function getUsername(email: string) {
    return email.substring(0, email.lastIndexOf("@"));
}

export function isDateExpired(date: Date) {
    const now = new Date();
    return date < now;
}

export async function saveToken(data: TokenData): Promise<HttpRes> {
    try {
        const accessToken = generateAccessToken({
            userId: data.userId,
            email: data.email,
        })
        const refreshToken = generateRefreshToken({
            userId: data.userId,
            email: data.email,
        })
        Token.updateMany({
            email: data.email, isExpired: false
        }, {
            isExpired: true
        }, {
            returnOriginal: false
        })
        const newToken = new Token({
            userId: data.userId,
            email: data.email,
            deviceUuId: data.deviceUuId,
            isExpired: false,
            accessToken,
            refreshToken
        })
        const isSaved = await newToken.save();
        if (isSaved) {
            return {
                "status": HttpStatus.SUCCESS,
                "message": `Authentication success`,
                "code": 200,
                "data": {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                }
            }
        } else {
            return {
                "status": HttpStatus.ERROR,
                "message": `Cant Save data!`,
                "code": 500,
                "data": null
            }
        }
    } catch (e) {
        return {
            "status": HttpStatus.ERROR,
            "message": `Cant Save data!`,
            "code": 500,
            "data": null
        }
    }
}