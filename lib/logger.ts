import winston from "winston";
import path from "path";

const logger = winston.createLogger({
  level: "error", 
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), "logs/error.log"), 
      level: "error" 
    }),
    new winston.transports.Console()
  ],
});

export default logger;