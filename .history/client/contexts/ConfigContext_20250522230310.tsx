import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getPublicConfig } from "@/lib/config";

interface ConfigContextType {
  config: Record<string, any>;
  isLoading: boolean;
  error: Error | null;
  get: <T = any>(key: string, defaultValue?: T) => T | undefined;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
  initialConfig?: Record<string, any>;
}

export function ConfigProvider({
  children,
  initialConfig = {},
}: ConfigProviderProps) {
  const [config, setConfig] = useState<Record<string, any>>(initialConfig);
  const [isLoading, setIsLoading] = useState(
    !initialConfig || Object.keys(initialConfig).length === 0,
  );
  const [error, setError] = useState<Error | null>(null);

  // Load configuration on mount
  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      if (Object.keys(initialConfig).length > 0) {
        // Skip loading if initial config is provided
        return;
      }

      try {
        const configData = await getPublicConfig();
        if (isMounted) {
          setConfig(configData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          console.error("Failed to load configuration:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [initialConfig]);

  // Get a nested config value using dot notation
  const get = <T = any,>(key: string, defaultValue?: T): T | undefined => {
    if (!key) return defaultValue;

    try {
      const value = key.split(".").reduce((obj, k) => {
        if (obj && typeof obj === "object" && k in obj) {
          return obj[k];
        }
        return undefined;
      }, config);

      return value !== undefined ? value : defaultValue;
    } catch (err) {
      console.error(`Error getting config value '${key}':`, err);
      return defaultValue;
    }
  };

  return (
    <ConfigContext.Provider value={{ config, isLoading, error, get }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

// Helper hook to get a specific config value
export function useConfigValue<T = any>(key: string, defaultValue?: T) {
  const { get, ...rest } = useConfig();
  const [value, setValue] = useState<T | undefined>(() =>
    get(key, defaultValue),
  );

  useEffect(() => {
    setValue(get(key, defaultValue));
  }, [key, defaultValue, get]);

  return { value, ...rest };
}
