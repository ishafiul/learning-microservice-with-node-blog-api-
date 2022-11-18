const express = require("express");
const app = express()
const server = require('http').createServer(app)
app.use(express.json());
require("dotenv").config();
const mongoose = require('mongoose');
const cors = require("cors");


const port = process.env.PORT || 8001;

app.use(cors({
    origin: "hhtp://localhost:8000"
}))


mongoose.connect(process.env.MONGO_URL).then(() => console.log('connected to mongodb'))


const authRoute = require('./routes/auth');

app.get('/', (req, res) => {
    var figlet = require('figlet');
    figlet('Auth-Service', {
        font: 'Doh',
    }, function (err, data) {
        res.send(`<div style='font-size: 10px;margin: auto;
        border: 3px solid #E8E8E8;
        display:flex;
        justify-content: center;
        background-color: #F5F5F5;
        padding: 10px; '><pre>${data} </pre></div>`)
    });

})

server.listen(port, () => console.log(`Auth Service is running at http://localhost:${port}`));