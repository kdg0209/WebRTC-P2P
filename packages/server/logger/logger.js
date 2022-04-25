import winston from "winston";
const { combine, timestamp, printf } = winston.format;
import winstonDaily from "winston-daily-rotate-file";
const logDir = "../../logs";

const logFormat = printf((log) => {
  return `${log.timestamp} [${log.level}] ▶ ${log.message}`;
});

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};
winston.addColors(colors);

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:MM:SS ||",
    }),
    logFormat
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      level: "debug",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.debug.log`,
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "1d",
    }),
    new winston.transports.DailyRotateFile({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.error.log`,
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "1d",
    }),
  ],
});

// 개발 환경에서 debug level의 logger 출력
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      level: "debug",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:MM:SS ||",
        }),
        logFormat
      ),
    })
  );
}

export default logger;
