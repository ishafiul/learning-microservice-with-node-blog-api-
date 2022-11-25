const express = require("express");
var proxy = require('express-http-proxy');
const app = express()
const server = require('http').createServer(app)
const Authmiddle = require('./middleware/auth')
new Authmiddle();
app.use(express.json());

app.set('view engine', 'ejs');


require("dotenv").config();
const port = process.env.PORT || 8000;

const cors = require("cors");

app.use(cors({
    origin: "*"
}))
app.use('/auth', proxy('http://localhost:8001'));
// app.use('/auth/test', authMiddle.token, proxy('http://localhost:8001/test'));

app.get('/', (req, res) => {
    var figlet = require('figlet');
    figlet('API-Service', {
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

server.listen(port, () => console.log(`API Service is running at http://localhost:${port}`));