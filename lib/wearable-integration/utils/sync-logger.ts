import { LogLevel } from '../types';

/**
 * Logger for synchronization operations
 */
export class SyncLogger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogEntries: number = 1000;
  
  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addLogEntry(LogLevel.DEBUG, message, data);
    }
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addLogEntry(LogLevel.INFO, message, data);
    }
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addLogEntry(LogLevel.WARN, message, data);
    }
  }
  
  /**
   * Log an error message
   * @param message The message to log
   * @param error Optional error to include with the log
   */
  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addLogEntry(LogLevel.ERROR, message, error);
    }
  }
  
  /**
   * Get the logs
   * @param limit Optional limit on the number of logs to retrieve
   * @returns Array of log entries
   */
  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }
  
  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Set the log level
   * @param level The new log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  
  /**
   * Check if a message at the given level should be logged
   * @param level The log level to check
   * @returns true if the message should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }
  
  /**
   * Add a log entry
   * @param level The log level
   * @param message The log message
   * @param data Optional data to include with the log
   */
  private addLogEntry(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.safeStringify(data) : undefined
    };
    
    this.logs.push(entry);
    
    // Trim logs if we exceed the maximum
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }
    
    // Also log to console for development
    this.logToConsole(entry);
  }
  
  /**
   * Log an entry to the console
   * @param entry The log entry to log
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // Extract time part
    const prefix = `[${timestamp}] [${entry.level}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data ? JSON.parse(entry.data) : '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data ? JSON.parse(entry.data) : '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data ? JSON.parse(entry.data) : '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data ? JSON.parse(entry.data) : '');
        break;
    }
  }
  
  /**
   * Safely stringify an object, handling circular references
   * @param obj The object to stringify
   * @returns The stringified object
   */
  private safeStringify(obj: any): string {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    });
  }
}

/**
 * Interface for log entries
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: string;
}