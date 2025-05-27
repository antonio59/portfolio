/**
 * A simple logger utility that wraps console methods
 * This allows for better control over logging in different environments
 */

type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor(level: LogLevel = "info") {
    this.logLevel = level;
  }

  public static getInstance(level?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(level);
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[this.logLevel] <= levels[level];
  }

  public debug(...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      process.stderr.write(
        `[DEBUG] ${new Date().toISOString()} - ${args.join(" ")}\n`,
      );
    }
  }

  public info(...args: unknown[]): void {
    if (this.shouldLog("info")) {
      process.stdout.write(
        `[INFO] ${new Date().toISOString()} - ${args.join(" ")}\n`,
      );
    }
  }

  public warn(...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      process.stderr.write(
        `[WARN] ${new Date().toISOString()} - ${args.join(" ")}\n`,
      );
    }
  }

  public error(...args: unknown[]): void {
    if (this.shouldLog("error")) {
      process.stderr.write(
        `[ERROR] ${new Date().toISOString()} - ${args.join(" ")}\n`,
      );
    }
  }
}

// Export a singleton instance
const logger = Logger.getInstance(
  process.env.NODE_ENV === "production" ? "info" : "debug",
);
export default logger;
