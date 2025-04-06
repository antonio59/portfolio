import React from 'react'; // Keep one React import
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient"; // Restore queryClient import

// Clear any stale cache before rendering (optional, but kept from original)
queryClient.clear();
console.log("Cache cleared on application start");

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  // Render the main App component, wrapped in StrictMode
  root.render(
    <React.StrictMode> 
      <App />
    </React.StrictMode>
  ); 
} else {
  console.error("Failed to find the root element");
}
