import { useEffect, useState } from "react";
import { getConfigValue } from "@/lib/config";

/**
 * React hook to access configuration values
 * @param key Dot notation path to the config value (e.g., 'api.endpoint')
 * @param defaultValue Default value if the key is not found
 */
export function useConfig<T = any>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const configValue = await getConfigValue<T>(key, defaultValue);
        if (isMounted) {
          setValue(configValue);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [key, defaultValue]);

  return { value, isLoading, error };
}

// Example usage:
// function MyComponent() {
//   const { value: siteName, isLoading } = useConfig('siteName', 'My Portfolio');
//
//   if (isLoading) return <div>Loading...</div>;
//
//   return <h1>Welcome to {siteName}</h1>;
// }
