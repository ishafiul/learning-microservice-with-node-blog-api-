"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
module.exports = class AuthMiddle {
    token(req, res, next) {
        if (req.headers.autorization) {
            const authHeader = req.headers.autorization;
            const token = authHeader.split(' ')[1];
            if (token) {
                (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_SECRET || '', (err, info) => {
                    if (err) {
                        return res.status(401).json({
                            err
                        });
                    }
                    else {
                        req.user = info;
                        next();
                    }
                });
            }
            else {
                return res.sendStatus(401);
            }
        }
        else {
            return res.sendStatus(401);
        }
        // tslint:disable-next-line:no-console
        console.log('middleware ok');
    }
};
