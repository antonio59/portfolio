import postgres from "postgres";
import { logger } from "./utils/logger";

// Initialize the database connection
let client: ReturnType<typeof postgres> | null = null;

export async function initializeDatabase() {
  try {
    // Check if DATABASE_URL environment variable is set
    if (!process.env.DATABASE_URL) {
      logger.warn("DATABASE_URL not found. Using in-memory storage.");
      return null;
    }

    logger.info("Initializing PostgreSQL connection...");

    // Create the connection with proper typing for postgres options
    const connectionOptions = {
      max: 10,
      prepare: false,
      ...(process.env.NODE_ENV === "production"
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    } as const;

    client = postgres(process.env.DATABASE_URL, connectionOptions);

    // Test the connection
    await client`SELECT 1`;

    logger.info("PostgreSQL connection established successfully");
    return client;
  } catch (error) {
    logger.error(
      "Failed to initialize database connection",
      error instanceof Error ? error : String(error),
    );
    return null;
  }
}

export function getDb() {
  if (!client) {
    throw new Error(
      "Database has not been initialized. Call initializeDatabase() first.",
    );
  }
  return client;
}

export async function closeDatabase() {
  if (client) {
    try {
      await client.end();
      logger.info("Database connection closed");
    } catch (error) {
      logger.error(
        "Error closing database connection",
        error instanceof Error ? error : String(error),
      );
    } finally {
      client = null;
    }
  }
}
