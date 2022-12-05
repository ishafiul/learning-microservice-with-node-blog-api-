"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = require("./routes/auth.route");
const dotenv_1 = require("dotenv");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.use(express_1.default.json());
(0, dotenv_1.config)();
const port = process.env.PORT || 8001;
app.use((0, cors_1.default)({
    origin: "hhtp://localhost:8000"
}));
mongoose_1.default.connect(process.env.MONGO_URL || '').then(() => console.log('connected to mongodb'));
app.get('/', (req, res) => {
    const figlet = require('figlet');
    figlet('Auth-Service', {
        font: 'Doh',
    }, (err, data) => {
        res.send(`<div style='font-size: 10px;margin: auto;
        border: 3px solid #E8E8E8;
        display:flex;
        justify-content: center;
        background-color: #F5F5F5;
        padding: 10px; '><pre>${data} </pre></div>`);
    });
});
app.use("/", auth_route_1.AuthRouter);
server.listen(port, () => console.log(`Auth Service is running at http://localhost:${port}`));
//# sourceMappingURL=server.js.map