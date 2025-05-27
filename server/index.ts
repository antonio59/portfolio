import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import http from "http";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { logger } from "./utils/logger";

interface AppError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

// Extend the express-session types
declare module "express-session" {
  interface SessionData {
    userId: number | undefined;
  }
}

// Extend the Express Request type
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      username: string;
    };
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Run when app starts up to seed the database with sample data
async function initDatabase() {
  try {
    logger.info("Seeding database with sample content...");
    const result = await seedDatabase();

    if (result.success) {
      logger.info("Database seeding completed successfully");
    } else {
      const errorMessage = "error" in result ? result.error : "Unknown error";
      logger.error("Error seeding database:", errorMessage);
    }
  } catch (error) {
    logger.error("Error initializing database:", error);
  }
}

// Initialize sample data
initDatabase().catch((error) => {
  logger.error("Error in initDatabase:", error);
});

// Set up session middleware
app.use(
  session({
    secret: "portfolio-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.session.userId) {
    req.user = { id: req.session.userId, username: "" }; // Add a default username
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown = undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson: unknown) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Handle 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

// Start the server
const startServer = async (): Promise<http.Server> => {
  await registerRoutes(app);

  // Error handling
  app.use((err: AppError, _req: Request, res: Response) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Importantly only setup vite in development and after
  // the other routes are registered so that the vite middleware
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Create a mock server for Vite in development
    const mockServer = http.createServer();
    await setupVite(app, mockServer);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;

  // Create the HTTP server with the Express app
  const httpServer = http.createServer(app as http.RequestListener);

  return new Promise((resolve) => {
    httpServer.listen(port, "0.0.0.0", () => {
      logger.info(`Server is running on port ${port}`);
      resolve(httpServer);
    });
  });
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error("Failed to start server:", error);
    process.exit(1);
  });
}

export { startServer };
