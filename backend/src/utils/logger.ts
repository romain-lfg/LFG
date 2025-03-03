/**
 * Logger utility for consistent logging across the application
 */

// Define log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Get log level from environment variable or default to INFO
const getLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL?.toUpperCase();
  
  switch (level) {
    case 'ERROR':
      return LogLevel.ERROR;
    case 'WARN':
      return LogLevel.WARN;
    case 'INFO':
      return LogLevel.INFO;
    case 'DEBUG':
      return LogLevel.DEBUG;
    default:
      return LogLevel.INFO; // Default to INFO
  }
};

// Current log level
const currentLogLevel = getLogLevel();

// Format log message with timestamp
const formatLogMessage = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

// Logger implementation
export const logger = {
  error: (message: string, error?: any): void => {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(formatLogMessage('ERROR', message));
      if (error) {
        if (error instanceof Error) {
          console.error(error.stack || error.message);
        } else {
          console.error(error);
        }
      }
    }
  },

  warn: (message: string): void => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(formatLogMessage('WARN', message));
    }
  },

  info: (message: string): void => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(formatLogMessage('INFO', message));
    }
  },

  debug: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(formatLogMessage('DEBUG', message));
      if (data) {
        console.debug(data);
      }
    }
  }
};
