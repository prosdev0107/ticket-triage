import { v4 as uuidv4 } from "uuid";

export interface LogContext {
  requestId?: string;
  provider?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  executionTimeMs?: number;
  [key: string]: unknown;
}

/**
 * Structured logger utility
 * Formats logs as JSON for easy parsing and analysis
 */
class Logger {
  private formatLog(level: string, message: string, context?: LogContext): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };
    return JSON.stringify(logEntry);
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatLog("INFO", message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatLog("ERROR", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatLog("WARN", message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatLog("DEBUG", message, context));
    }
  }
}

export const logger = new Logger();

/**
 * Generates a unique request ID for tracking requests across the system
 */
export function generateRequestId(): string {
  return uuidv4();
}
