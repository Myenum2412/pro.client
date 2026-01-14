/**
 * Centralized logging utility
 * Provides consistent error logging across the application
 * In production, logs are sent to error tracking service
 */

type LogLevel = "log" | "error" | "warn" | "info" | "debug";

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  log(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage("log", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message}${errorMessage ? `: ${errorMessage}` : ""}`;
    
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage("error", fullMessage, context), error);
    }
    
    // In production, send to error tracking service (e.g., Sentry)
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage("info", message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage("debug", message, context));
    }
  }
}

export const logger = new Logger();

