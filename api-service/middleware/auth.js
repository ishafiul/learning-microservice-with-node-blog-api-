const jwt  = require('jsonwebtoken');
module.exports = class Authmiddle{
    token(req, res, next) {
        if (req.headers['autorization']){
            const authHeader = req.headers['autorization']
            const token = authHeader.split(' ')[1]
            if(token){
                jwt.verify(token, process.env.TOKEN_SECRET,(err,info)=>{
                    if (err) {
                        return res.status(401).json({
                            err
                        })
                    }
                    else{
                        req.user = info
                        next()
                    }
                })
            }
            else{
                return res.sendStatus(401)
            }
        }
        else{
            return res.sendStatus(401)
        }
        console.log('middleware ok')
    }
}