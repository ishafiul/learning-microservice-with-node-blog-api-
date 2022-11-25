import {verify} from "jsonwebtoken";
import {config} from "dotenv";

config();
module.exports = class AuthMiddle {
    token(req: { headers: { [x: string]: any; }; user: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { err: any; }): any; new(): any; }; }; sendStatus: (arg0: number) => any; }, next: () => void) {
        if (req.headers.autorization) {
            const authHeader = req.headers.autorization
            const token = authHeader.split(' ')[1]
            if (token) {
                verify(token, process.env.TOKEN_SECRET || '', (err: any, info: any) => {
                    if (err) {
                        return res.status(401).json({
                            err
                        })
                    } else {
                        req.user = info
                        next()
                    }
                })
            } else {
                return res.sendStatus(401)
            }
        } else {
            return res.sendStatus(401)
        }
        // tslint:disable-next-line:no-console
        console.log('middleware ok')
    }
}