/**
 * Production-safe logging utility
 * จะแสดง log เฉพาะใน development environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private shouldLog(level: LogLevel): boolean {
    // ใน production แสดงเฉพาะ error
    if (!this.isDevelopment && level !== 'error') {
      return false;
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: any): any[] {
    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;
    
    if (context) {
      return [prefix, message, context];
    }
    return [prefix, message];
  }

  debug(message: string, context?: any): void {
    if (!this.shouldLog('debug')) return;
    console.log(...this.formatMessage('debug', message, context));
  }

  info(message: string, context?: any): void {
    if (!this.shouldLog('info')) return;
    console.info(...this.formatMessage('info', message, context));
  }

  warn(message: string, context?: any): void {
    if (!this.shouldLog('warn')) return;
    console.warn(...this.formatMessage('warn', message, context));
  }

  error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return;
    console.error(...this.formatMessage('error', message, error));
  }

  // Specialized logging methods
  auth(message: string, context?: any): void {
    this.debug(`[AUTH] ${message}`, context);
  }

  firebase(message: string, context?: any): void {
    this.debug(`[FIREBASE] ${message}`, context);
  }

  api(message: string, context?: any): void {
    this.debug(`[API] ${message}`, context);
  }

  admin(message: string, context?: any): void {
    this.debug(`[ADMIN] ${message}`, context);
  }

  bill(message: string, context?: any): void {
    this.debug(`[BILL] ${message}`, context);
  }

  // Performance logging
  time(label: string): void {
    if (!this.isDevelopment) return;
    console.time(label);
  }

  timeEnd(label: string): void {
    if (!this.isDevelopment) return;
    console.timeEnd(label);
  }

  // Group logging
  group(label: string): void {
    if (!this.isDevelopment) return;
    console.group(label);
  }

  groupEnd(): void {
    if (!this.isDevelopment) return;
    console.groupEnd();
  }
}

// Export singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const {
  debug,
  info,
  warn,
  error,
  auth: authLog,
  firebase: firebaseLog,
  api: apiLog,
  admin: adminLog,
  bill: billLog,
} = logger;

// Default export
export default logger; 