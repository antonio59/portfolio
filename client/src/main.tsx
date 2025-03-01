import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Clear any stale cache before rendering
queryClient.clear();
console.log("Cache cleared on application start");

createRoot(document.getElementById("root")!).render(<App />);
