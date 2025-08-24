export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  error?: Error;
  data?: any;
}

export interface ILoggingService {
  debug(message: string, context?: string, data?: any): void;
  info(message: string, context?: string, data?: any): void;
  warn(message: string, context?: string, data?: any): void;
  error(message: string, error?: Error, context?: string, data?: any): void;
}

export class LoggingService implements ILoggingService {
  private static instance: LoggingService;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, error?: Error, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      data
    };
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const error = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : '';
    const data = entry.data ? `\nData: ${JSON.stringify(entry.data, null, 2)}` : '';
    
    return `${timestamp} ${entry.level.toUpperCase()} ${context} ${entry.message}${error}${data}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log WARN and ERROR
    if (!this.isDevelopment) {
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }
    // In development, log everything
    return true;
  }

  debug(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, undefined, data);
      console.debug(this.formatLogEntry(entry));
    }
  }

  info(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context, undefined, data);
      console.info(this.formatLogEntry(entry));
    }
  }

  warn(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context, undefined, data);
      console.warn(this.formatLogEntry(entry));
    }
  }

  error(message: string, error?: Error, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, error, data);
      console.error(this.formatLogEntry(entry));
    }
  }
}
