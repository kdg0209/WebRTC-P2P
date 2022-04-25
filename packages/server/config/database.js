import mysql from "mysql";
import path from "path";
import dotenv from "dotenv";
import logger from "./../logger/logger.js";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV == "production"
      ? path.resolve() + "/config/.env.service.prod"
      : path.resolve() + "/config/.env.service.dev"
  ),
});

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_BASE,
  connectionLimit: 10,
  charset: "utf8mb4",
};

const pool = mysql.createPool(config);
logger.debug("Connection pool created.");

pool.on("acquire", function (connection) {
  logger.debug(`Connection ${connection.threadId} acquired --> 요청`);
});

pool.on("enqueue", function () {
  logger.debug(`Waiting for available connection slot --> 대기`);
});

pool.on("release", function (connection) {
  logger.debug(`Connection ${connection.threadId} released --> 해제`);
});

function getConnection(callback) {
  pool.getConnection(function (err, conn) {
    if (!err) {
      callback(conn);
    } else {
      logger.error(err);
    }
  });
}

export default getConnection;
