// This function serves environment variables to the client
import { createServer, IncomingMessage, ServerResponse } from "http";

// These environment variables are set in the Supabase Dashboard
const config = {
  // Add any public configuration here
  public: {
    siteName: "My Portfolio",
    // Add other public config as needed
  },
  // Private config is handled through environment variables
};

// Set CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS method for CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    // You can add authentication here if needed
    // const token = req.headers.authorization?.replace('Bearer ', '');
    // if (!token) {
    //   res.writeHead(401, { 'Content-Type': 'application/json' });
    //   res.end(JSON.stringify({ error: 'Unauthorized' }));
    //   return;
    // }

    // Return the public config
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(config.public));
  } catch (error) {
    console.error("Error in config function:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

// Start the server
const PORT = process.env['PORT'] || 54321;
server.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});

// Handle process termination
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.info("HTTP server closed");
  });
});

export default server;
