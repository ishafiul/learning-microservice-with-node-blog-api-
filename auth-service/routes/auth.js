const router =  require("express").Router();
const  User =require("../schema/User");
require("dotenv").config();
const CryptoJS = require("crypto-js");


const jwt  = require('jsonwebtoken');
//register
router.post('/signup',async (req,res)=>{
    try {
        const hashPassword = CryptoJS.AES.encrypt(req.body.password, process.env.HASH_KEY).toString();
        const newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password: hashPassword,
        })
        const user = await newUser.save();
        //const token = jwt.sign(user, process.env.TOKEN_SECRET)
        res.status(201).json({
            message: 'User Created Successfully',
            status : 'created'
        });
    }
    catch (err){
        res.status(500).json(err);
    }
})

//login
router.post('/login',async (req,res)=>{
    try {
        const user = await User.findOne({username:req.body.email});
        if (!user){
            res.status(401).json({error: "User not found"});
        }
        else{
            const bytes  = CryptoJS.AES.decrypt(user.password, process.env.HASH_KEY);
            const passValidate =bytes.toString(CryptoJS.enc.Utf8);
            if (!passValidate){
                res.status(500).json('wrong username or password!');
            }
            const data = user._doc;

           const token = generetAccessToken({
               userId: data._id,
               username: data.username,
               email: data.email,
           })
            const refresh_token = generetRefreshToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            })
            res.status(200).json({
                access_token: token,
                refresh_token : refresh_token,
            });
        }
    }
    catch (err){
        res.status(404).json(err);
    }
})

//token

router.post('/token', async (req, res)=>{
    try {
        const refresh_token = req.body.refresh_token
        jwt.verify(refresh_token, process.env.TOKEN_SECRET_REFRESH,(err, data)=>{
            const token = generetAccessToken({
                userId: data._id,
                username: data.username,
                email: data.email,})
            const refresh_token = generetRefreshToken({
                userId: data._id,
                username: data.username,
                email: data.email,
            })
            //const refresh_token_new = jwt.sign(data, process.env.TOKEN_SECRET_REFRESH)
            res.status(200).json({
                access_token: token,
                refresh_token : refresh_token,
            });
        })
    }
    catch (err){
        res.status(404).json(err);
    }
})


//generet token
function generetAccessToken(user){
    return jwt.sign(user , process.env.TOKEN_SECRET, {expiresIn: '1m'})
}

function generetRefreshToken(user){
    return jwt.sign(user , process.env.TOKEN_SECRET_REFRESH, {expiresIn: '2m'})
}
module.exports = router;