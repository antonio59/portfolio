import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Define the shape of a table
export interface Table<T = Record<string, unknown>, I = T, U = T> {
  Row: T;
  Insert: I;
  Update: U;
}

// Define your database schema here

export interface Database {
  // Example:
  // profiles: Table<{
  //   id: string;
  //   created_at: string;
  //   // ... other fields
  // }, {
  //   id?: string;
  //   created_at?: string;
  //   // ... other fields
  // }>;
  // Add other tables as needed
}

// This is the main Tables type that will be used throughout your application
export type Tables = Database;

export type TableName = keyof Tables;

export type TableRow<T extends TableName> = Tables[T]["Row"];
export type TableInsert<T extends TableName> = Tables[T]["Insert"];
export type TableUpdate<T extends TableName> = Tables[T]["Update"];
