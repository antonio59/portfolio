import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(__filename);

function createNetlifyConfig() {
  console.log('Creating Netlify configuration...');
  
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

  fs.writeFileSync(path.join(rootDir, 'netlify.toml'), netlifyConfig);
  console.log('Created netlify.toml');
}

function createNetlifyEnvFile() {
  console.log('Creating Netlify environment file...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.warn('\x1b[33mWARNING: DATABASE_URL environment variable is not set.\x1b[0m');
    console.log('You will need to set it in Netlify environment variables.');
  }
  
  const envContent = `DATABASE_URL=${process.env.DATABASE_URL || "paste_your_supabase_url_here"}

# Add any other environment variables here
`;

  fs.writeFileSync(path.join(rootDir, '.env.production'), envContent);
  console.log('Created .env.production (template for Netlify environment variables)');
}

function updateBuildScripts() {
  console.log('Updating build scripts...');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add or update necessary scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "build": "vite build",
    "build:netlify": "vite build && npm run build:functions",
    "build:functions": "mkdir -p api && cp -r server/* api/ && cp shared/* api/"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json build scripts');
}

function createNetlifyReadme() {
  console.log('Creating Netlify deployment guide...');
  
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

  fs.writeFileSync(path.join(rootDir, 'NETLIFY_GUIDE.md'), readmeContent);
  console.log('Created NETLIFY_GUIDE.md');
}

function main() {
  console.log('\x1b[36m=== Preparing project for Netlify deployment ===\x1b[0m');
  
  // Create Netlify config file
  createNetlifyConfig();
  
  // Create environment file template
  createNetlifyEnvFile();
  
  // Update package.json scripts
  updateBuildScripts();
  
  // Create Netlify deployment guide
  createNetlifyReadme();
  
  console.log('\n\x1b[32mSetup completed successfully!\x1b[0m');
  console.log('\x1b[33mNext steps:\x1b[0m');
  console.log('1. Ensure DATABASE_URL is set in your environment');
  console.log('2. Run \x1b[36mnode migrate-to-supabase.js\x1b[0m to migrate data to Supabase');
  console.log('3. Follow the instructions in NETLIFY_GUIDE.md for deployment');
  console.log('\n\x1b[36mHappy deploying! 🚀\x1b[0m');
}

// Run the main function
main();