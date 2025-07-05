import fs from 'fs';
import path from 'path';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private logLevel: LogLevel;
  private enableFileLogging: boolean;
  private logFilePath: string;

  constructor(logLevel: LogLevel = LogLevel.INFO, enableFileLogging: boolean = false, logFileName: string = 'app.log') {
    this.logLevel = logLevel;
    this.enableFileLogging = enableFileLogging;
    this.logFilePath = path.join(process.cwd(), 'logs', logFileName);

    if (this.enableFileLogging) {
      // Ensure log directory exists
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      // Clear log file on startup in development, append in production
      if (process.env.NODE_ENV !== 'production') {
        fs.writeFileSync(this.logFilePath, '');
      }
    }
  }

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    const logEntry: { timestamp: string; level: LogLevel; message: string; args?: unknown[] } = {
      timestamp,
      level,
      message,
    };
    if (args.length > 0) {
      logEntry.args = args;
    }
    const logMessage = JSON.stringify(logEntry);

    // Console logging
    if (this.shouldLog(level)) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage);
          break;
        case LogLevel.INFO:
          console.info(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
      }
    }

    // File logging
    if (this.enableFileLogging) {
      fs.appendFileSync(this.logFilePath, logMessage + '\n');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  true, // Enable file logging
  'bot.log' // Log file name
);