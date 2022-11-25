import express from "express";
import {createServer} from "http";
import mongoose from 'mongoose';
import cors from "cors";
import {AuthRouter} from "./routes/auth.route";

import {config} from "dotenv";

const app = express()
const server = createServer(app)
app.use(express.json());

config();

const port = process.env.PORT || 8001;

app.use(cors({
    origin: "hhtp://localhost:8000"
}))
// tslint:disable-next-line:no-console
mongoose.connect(process.env.MONGO_URL || '').then(() => console.log('connected to mongodb'))


app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    const figlet = require('figlet');
    figlet('Auth-Service', {
        font: 'Doh',
    }, (err: any, data: any) => {
        res.send(`<div style='font-size: 10px;margin: auto;
        border: 3px solid #E8E8E8;
        display:flex;
        justify-content: center;
        background-color: #F5F5F5;
        padding: 10px; '><pre>${data} </pre></div>`)
    });

})

app.use("/", AuthRouter);

// tslint:disable-next-line:no-console
server.listen(port, () => console.log(`Auth Service is running at http://localhost:${port}`));