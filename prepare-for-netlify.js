const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

// Logger object with allowed console methods
const logger = {
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  debug: (...args) => console.debug(...args),
};

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(__filename);

function createNetlifyConfig() {
  logger.info("Creating Netlify configuration...");

  const netlifyConfig = `[build]
  command = "npm run build"
  publish = "client/dist"

[functions]
  directory = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

  const configPath = path.join(rootDir, "netlify.toml");
  fs.writeFileSync(configPath, netlifyConfig);
  logger.info(`Created ${path.relative(rootDir, configPath)}`);
}

function createNetlifyEnvFile() {
  logger.info("Creating Netlify environment file...");

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    logger.warn("WARNING: DATABASE_URL environment variable is not set.");
    logger.info("You will need to set it in Netlify environment variables.");
  }

  const envContent = `DATABASE_URL=${process.env.DATABASE_URL || "paste_your_supabase_url_here"}

# Add any other environment variables here
`;

  const envPath = path.join(rootDir, ".env.production");
  fs.writeFileSync(envPath, envContent);
  logger.info(
    `Created ${path.relative(rootDir, envPath)} (template for Netlify environment variables)`,
  );
}

function updateBuildScripts() {
  logger.info("Updating build scripts...");

  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Add or update necessary scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    build: "vite build",
    "build:netlify": "vite build && npm run build:functions",
    "build:functions":
      "mkdir -p api && cp -r server/* api/ && cp shared/* api/",
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  logger.info("Updated package.json build scripts");
}

function createNetlifyReadme() {
  logger.info("Creating Netlify deployment guide...");

  const readmeContent = `# Netlify Deployment Guide

## Prerequisites
1. A Supabase account and project set up
2. Netlify account and Netlify CLI installed

## Setup Steps

### 1. Database Setup
Ensure your Supabase database is set up and you have the connection string.
It should look like: \`postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres\`

### 2. Environment Variables
Set up the following environment variables in Netlify:
- DATABASE_URL: Your Supabase connection string

### 3. Deployment Steps
1. Migrate your data to Supabase:
   \`\`\`
   export DATABASE_URL="your_supabase_url"
   node migrate-to-supabase.js
   \`\`\`

2. Log in to Netlify CLI:
   \`\`\`
   netlify login
   \`\`\`

3. Initialize your Netlify site:
   \`\`\`
   netlify init
   \`\`\`

4. Deploy to Netlify:
   \`\`\`
   npm run build:netlify
   netlify deploy --prod
   \`\`\`

## Troubleshooting
- If you encounter database connection issues, check your DATABASE_URL format and that it's properly set in Netlify's environment variables.
- Make sure your Supabase project's network settings allow connections from Netlify.

## Maintenance
After deployment, use the Netlify dashboard to:
- Monitor site performance
- Set up custom domains
- Configure build hooks
- Manage environment variables
`;

  const guidePath = path.join(rootDir, "NETLIFY_GUIDE.md");
  fs.writeFileSync(guidePath, readmeContent);
  logger.info(`Created ${path.relative(rootDir, guidePath)}`);
}

function main() {
  logger.info("=== Preparing project for Netlify deployment ===");

  // Create Netlify config file
  createNetlifyConfig();

  // Create environment file template
  createNetlifyEnvFile();

  // Update package.json scripts
  updateBuildScripts();

  // Create Netlify deployment guide
  createNetlifyReadme();

  logger.info("\n✅ Setup completed successfully!");
  logger.info("\nNext steps:");
  logger.info("1. Ensure DATABASE_URL is set in your environment");
  logger.info(
    '2. Run "node migrate-to-supabase.js" to migrate data to Supabase',
  );
  logger.info("3. Follow the instructions in NETLIFY_GUIDE.md for deployment");
  logger.info("\nHappy deploying! 🚀");
}

// Run the main function
main();
