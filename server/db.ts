import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Initialize the database connection
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function initializeDatabase() {
  try {
    // Check if DATABASE_URL environment variable is set
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not found. Using in-memory storage.");
      return null;
    }
    
    console.log("Initializing PostgreSQL connection...");
    
    // Create the connection
    client = postgres(process.env.DATABASE_URL, { 
      max: 10,
      prepare: false
    });
    
    // Initialize Drizzle ORM
    db = drizzle(client, { schema });
    
    console.log("PostgreSQL connection established successfully.");
    
    return db;
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    return null;
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database has not been initialized. Call initializeDatabase() first.");
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.end();
    client = null;
    db = null;
    console.log("Database connection closed.");
  }
}