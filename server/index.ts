// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
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
app.set('env', 'development'); // Ensure development mode

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, configure for production
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://antoniosmith.com', 'https://www.antoniosmith.com'] 
    : true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit login attempts
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
});

const testimonialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit testimonial submissions
  message: "Too many testimonial submissions, please try again later.",
});

app.use('/api/', limiter);
app.use('/api/login', authLimiter);
app.use('/api/testimonials/submit', testimonialLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Run when app starts up to initialize storage (seeding disabled since we have real data)
async function initDatabase() {
  try {
    // Initialize storage first
    const { initializeStorage } = await import("./storage");
    await initializeStorage();
    logger.info("Database storage initialized");
    
    // Skip seeding - we have real data from Supabase migration
    // Uncomment below if you need to seed a fresh database
    // const result = await seedDatabase();
    // if (result.success) {
    //   logger.info("Database seeding completed successfully");
    // }
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

// Start the server
const startServer = async (): Promise<http.Server> => {
  await registerRoutes(app);

  // Importantly setup vite in development BEFORE 404 handler
  // so that vite can serve the frontend files
  if (app.get("env") === "development") {
    // Create a mock server for Vite in development
    const mockServer = http.createServer();
    await setupVite(app, mockServer);
  } else {
    serveStatic(app);
  }

  // Error handling - must be last
  app.use((err: AppError, _req: Request, res: Response) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // ALWAYS serve the app on port 5001
  // this serves both the API and the client
  const port = 5001;

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
const isMain = import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'test';
if (isMain) {
  startServer().catch((error) => {
    logger.error("Failed to start server:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  });
}

export { startServer };
