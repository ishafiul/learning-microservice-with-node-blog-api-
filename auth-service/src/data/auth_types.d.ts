import {UserType} from "./auth_enums";


export type AppInfo = {
    versionName: string,
    versionCode: string,
}

export type UserLocation = {
    coordinates: [],
}

export type Device = {
    userType: UserType,
    deviceType: string,
    osVersionCode?: string,
    osVersionRelease?: string,
    deviceBrand?: string,
    deviceModel?: string,
    deviceManufacturer?: string,
    appInfo: AppInfo,
    location?: UserLocation,
    ipAddress: string
};


export type OtpReq = {
    email: string,
    deviceUuid: string
}

export type OtpVerify = {
    otp: string,
    email: string,
    deviceUuid: string
}

export type IsoDateString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

export type Otp = {
    email: string,
    userId: string,
    deviceUuid: string,
    otp: string,
    isExpired: boolean,
    expiredAt: Date,

}

export type UserData = {
    email: string,
    userName: string,
    password: string,
}

export type TokenData = {
    userId: string,
    email: string,
    deviceUuId: string,
}

export type HttpRes = {
    status: string,
    message: string,
    code: number,
    data: object | null,
}

export type RefreshToken = {
    refreshToken: string,
    deviceUuId: string,
}

