import express from 'express';
import fs from 'fs';
import HTTPS from 'https';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import logger from './logger/logger.js';
import { socketInit } from './socket/socket.js';
dotenv.config();
const PORT = 3001;
let server;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

dotenv.config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV == 'production' ? path.resolve() + '/config/.env.service.prod' : path.resolve() + '/config/.env.service.dev'),
});

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  try {
    const option = {
      ca: fs.readFileSync(path.resolve() + '/ssl/letsencrypt/live/webrtc.shop/fullchain1.pem'),
      key: fs.readFileSync(path.resolve() + '/ssl/letsencrypt/live/webrtc.shop/privkey1.pem'),
      cert: fs.readFileSync(path.resolve() + '/ssl/letsencrypt/live/webrtc.shop/cert1.pem'),
    };

    server = HTTPS.createServer(option, app).listen(PORT, () => {
      logger.debug(`[HTTPS] Soda Server is started on port : ` + PORT);
    });
  } catch (error) {
    logger.debug('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
  }
} else {
  server = app.listen(PORT, () => {
    logger.debug(`[HTTP] Soda Server is started on port : ` + PORT);
  });
}

socketInit(server);
