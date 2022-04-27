import express from 'express';
import cors from 'cors';
import logger from './logger/logger.js';
import { socketInit } from './socket/socket.js';
const app = express();
let server;
const PORT = 3001;

app.use(cors());

server = app.listen(PORT, () => {
  logger.debug(`[HTTP] Soda Server is started on port : ` + PORT);
});
socketInit(server);
