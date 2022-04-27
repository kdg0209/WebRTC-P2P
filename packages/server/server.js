import express from "express";
import fs from "fs";
import http from "http";
import cors from "cors";
import { socketInit } from "./socket/socket.js";
const app = express();
const server = http.createServer(app);
const PORT = 3001;

app.use(cors());

socketInit(server);
server = app.listen(PORT, () => {
    logger.debug(`[HTTP] Soda Server is started on port : ` + PORT);
});
