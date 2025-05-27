import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { SupabaseClient } from "@supabase/supabase-js";

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the logger
import logger from "../src/utils/logger.js";

dotenv.config({ path: join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  logger.error("Missing required environment variables");
  logger.error(
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file",
  );
  process.exit(1);
}

interface Database {
  public: {
    Tables: Record<string, unknown>;
    Functions: {
      exec_sql: {
        Args: { sql: string };
        Returns: unknown;
      };
    };
  };
}

const supabase: SupabaseClient<Database> = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

async function applyMigrations(): Promise<void> {
  logger.info("Starting database migrations...");

  try {
    // Read the migration file
    const migrationPath = join(
      __dirname,
      "../supabase/migrations/20240518230000_initial_schema.sql",
    );
    logger.debug(`Reading migration file: ${migrationPath}`);

    const sql = readFileSync(migrationPath, "utf8");
    logger.debug(`Successfully read migration file (${sql.length} characters)`);

    logger.info("Applying database migrations...");

    // Execute the SQL using the Supabase API
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      logger.error("Error applying migrations:", error);
      process.exit(1);
    }

    logger.info("✅ Database migrations applied successfully!");
    logger.info("Please check your Supabase dashboard to verify the schema.");
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Error applying migrations:", errorMessage);
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
    process.exit(1);
  }
}

// Execute the migrations
applyMigrations().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  logger.error("Unhandled error in applyMigrations:", errorMessage);
  if (error instanceof Error && error.stack) {
    logger.debug(error.stack);
  }
  process.exit(1);
});
