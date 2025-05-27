type LogLevel = "info" | "warn" | "error";
type Loggable = string | number | boolean | object | Error | null | undefined;

const formatMessage = (message: Loggable): string => {
  if (message instanceof Error) {
    return `${message.name}: ${message.message}\n${message.stack || ""}`;
  }
  if (typeof message === "object" && message !== null) {
    return JSON.stringify(message, null, 2);
  }
  return String(message);
};

const log = (level: LogLevel, ...args: Loggable[]): void => {
  if (process.env.NODE_ENV === "test") return;

  const timestamp = new Date().toISOString();
  const formattedArgs = args.map((arg) => formatMessage(arg)).join(" ");
  const message = `[${timestamp}] [${level.toUpperCase()}] ${formattedArgs}`;

  // Use process.stdout/stderr directly in Node.js, or console in the browser
  if (typeof process !== "undefined" && process.stdout && process.stderr) {
    const output = level === "error" ? process.stderr : process.stdout;
    output.write(`${message}\n`);
  } else {
    // Fallback to console in browser
    const consoleMethod = console[level] || console.log;
    consoleMethod(message);
  }
};

export const logger = {
  info: (...args: Loggable[]): void => log("info", ...args),
  warn: (...args: Loggable[]): void => log("warn", ...args),
  error: (...args: Loggable[]): void => log("error", ...args),
};
