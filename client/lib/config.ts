import { supabase } from "./supabase";

// Cache for the config
let configCache: Record<string, unknown> | null = null;

/**
 * Fetches the public configuration from the Edge Function
 */
export async function getPublicConfig(): Promise<Record<string, any>> {
  // Return cached config if available
  if (configCache) {
    return configCache;
  }

  try {
    const { data, error } = await supabase.functions.invoke("config", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error) throw error;

    // Cache the config
    configCache = data as Record<string, any>;
    return configCache;
  } catch (error) {
    console.error("Failed to fetch config:", error);
    throw error;
  }
}

/**
 * Gets a specific configuration value
 * @param key Dot notation path to the config value (e.g., 'api.endpoint')
 * @param defaultValue Default value if the key is not found
 */
export async function getConfigValue<T = unknown>(
  key: string,
  defaultValue?: T,
): Promise<T | undefined> {
  try {
    const config = await getPublicConfig();
    const value = key.split(".").reduce<unknown>((obj, k) => {
      if (obj && typeof obj === "object" && k in (obj as object)) {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, config);

    return value !== undefined ? (value as T) : defaultValue;
  } catch (error) {
    console.error(`Error getting config value ${key}:`, error);
    return defaultValue;
  }
}

// Re-export types for better type inference
export type {
  Tables,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate,
} from "./supabase";

// Example usage:
// const siteName = await getConfigValue('siteName', 'My Portfolio');
