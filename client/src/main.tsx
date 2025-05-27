import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { logger } from "./lib/logger";
import App from "./App";
import "./index.css";

// Create a client
const queryClient = new QueryClient();

// Clear any stale cache before rendering
queryClient.clear();

logger.info("Cache cleared on application start");

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
