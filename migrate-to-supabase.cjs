#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Get current directory
const rootDir = process.cwd();

// Create interactive readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Check if DATABASE_URL is set
async function checkDatabaseUrl() {
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log(`${COLORS.yellow}DATABASE_URL environment variable is not set.${COLORS.reset}`);
    console.log(`${COLORS.cyan}Please enter your Supabase PostgreSQL connection string:${COLORS.reset}`);
    console.log(`${COLORS.white}Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres${COLORS.reset}`);
    
    databaseUrl = await prompt('> ');
    
    if (!databaseUrl) {
      console.error(`${COLORS.red}No database URL provided. Aborting migration.${COLORS.reset}`);
      rl.close();
      process.exit(1);
    }
    
    // Set the environment variable for the current process
    process.env.DATABASE_URL = databaseUrl;
    
    // Suggest adding to .env file
    const envPath = path.join(rootDir, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    if (!envContent.includes('DATABASE_URL=')) {
      const addToEnv = await prompt(`${COLORS.yellow}Would you like to add this database URL to your .env file? (y/n)${COLORS.reset} `);
      
      if (addToEnv.toLowerCase() === 'y') {
        fs.appendFileSync(envPath, `\nDATABASE_URL="${databaseUrl}"\n`);
        console.log(`${COLORS.green}Added DATABASE_URL to .env file.${COLORS.reset}`);
      }
    }
  }
  
  return databaseUrl;
}

// Update storage implementation to use Supabase
function updateStorageImplementation() {
  console.log(`${COLORS.cyan}Updating storage implementation to use Supabase...${COLORS.reset}`);
  
  const storageFile = path.join(rootDir, 'server', 'storage.ts');
  if (!fs.existsSync(storageFile)) {
    console.error(`${COLORS.red}Could not find storage.ts file. Aborting.${COLORS.reset}`);
    return false;
  }
  
  let storageContent = fs.readFileSync(storageFile, 'utf8');
  
  // Check if already using Supabase
  if (storageContent.includes('export let storage: IStorage = new SupabaseStorage();')) {
    console.log(`${COLORS.green}Already using Supabase storage implementation.${COLORS.reset}`);
    return true;
  }
  
  // Check if SupabaseStorage is imported
  if (!storageContent.includes('import { SupabaseStorage }')) {
    storageContent = storageContent.replace(
      'export let storage: IStorage = new MemStorage();',
      '// export let storage: IStorage = new MemStorage();\n' +
      'import { SupabaseStorage } from "./supabase-storage";\n' +
      'export let storage: IStorage = new SupabaseStorage();'
    );
  } else {
    // Just update the storage implementation line
    storageContent = storageContent.replace(
      'export let storage: IStorage = new MemStorage();',
      '// export let storage: IStorage = new MemStorage();\n' +
      'export let storage: IStorage = new SupabaseStorage();'
    );
  }
  
  fs.writeFileSync(storageFile, storageContent);
  console.log(`${COLORS.green}Updated storage.ts to use Supabase implementation.${COLORS.reset}`);
  return true;
}

// Run Drizzle migration to push schema to database
async function runSchemaMigration() {
  console.log(`${COLORS.cyan}Running database schema migration with Drizzle...${COLORS.reset}`);
  
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log(`${COLORS.green}Database schema migration completed successfully.${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Error running database migration:${COLORS.reset}`, error.message);
    
    const retry = await prompt(`${COLORS.yellow}Would you like to retry the migration? (y/n)${COLORS.reset} `);
    if (retry.toLowerCase() === 'y') {
      return runSchemaMigration();
    }
    
    console.log(`${COLORS.yellow}Migration failed. You can run it manually later with: npm run db:push${COLORS.reset}`);
    return false;
  }
}

// Seed the database with initial data
async function seedDatabase() {
  console.log(`${COLORS.cyan}Seeding database with initial data...${COLORS.reset}`);
  
  const seedFile = path.join(rootDir, 'server', 'seed.ts');
  if (!fs.existsSync(seedFile)) {
    console.log(`${COLORS.yellow}Seed file not found (server/seed.ts). Skipping database seeding.${COLORS.reset}`);
    return true;
  }
  
  try {
    execSync('npx tsx server/seed.ts', { stdio: 'inherit' });
    console.log(`${COLORS.green}Database seeding completed successfully.${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Error seeding database:${COLORS.reset}`, error.message);
    
    const skip = await prompt(`${COLORS.yellow}Would you like to skip seeding and continue? (y/n)${COLORS.reset} `);
    return skip.toLowerCase() === 'y';
  }
}

// Check if Netlify.toml needs to be generated
async function setupNetlifyConfig() {
  console.log(`${COLORS.cyan}Setting up Netlify configuration...${COLORS.reset}`);
  
  const netlifyTomlPath = path.join(rootDir, 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    console.log(`${COLORS.green}netlify.toml already exists.${COLORS.reset}`);
    return true;
  }
  
  const createConfig = await prompt(`${COLORS.yellow}Would you like to create a netlify.toml configuration file? (y/n)${COLORS.reset} `);
  if (createConfig.toLowerCase() !== 'y') {
    return true;
  }
  
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

  fs.writeFileSync(netlifyTomlPath, netlifyConfig);
  console.log(`${COLORS.green}Created netlify.toml configuration file.${COLORS.reset}`);
  return true;
}

// Test database connection
async function testDatabaseConnection() {
  console.log(`${COLORS.cyan}Testing database connection...${COLORS.reset}`);
  
  try {
    // Simple test using any direct database query
    execSync('npx tsx -e "import { getDb } from \'./server/db\'; async function test() { const db = getDb(); console.log(\'Connection successful!\'); process.exit(0); } test().catch(err => { console.error(err); process.exit(1); });"', { 
      stdio: 'inherit',
      env: process.env
    });
    
    console.log(`${COLORS.green}Database connection test successful.${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Database connection test failed:${COLORS.reset}`, error.message);
    console.log(`${COLORS.yellow}Please check your DATABASE_URL and ensure:${COLORS.reset}`);
    console.log(`  1. The username and password are correct`);
    console.log(`  2. The host and port are accessible from your machine`);
    console.log(`  3. Database permissions allow connections from your IP address`);
    
    return false;
  }
}

// Update build scripts for Netlify deployment
async function updateBuildScripts() {
  console.log(`${COLORS.cyan}Updating build scripts for Netlify deployment...${COLORS.reset}`);
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`${COLORS.red}package.json not found. Cannot update build scripts.${COLORS.reset}`);
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add necessary build scripts if they don't exist
  let modified = false;
  
  if (!packageJson.scripts.build) {
    packageJson.scripts.build = "vite build";
    modified = true;
  }
  
  if (!packageJson.scripts['build:netlify']) {
    packageJson.scripts['build:netlify'] = "vite build && npm run build:functions";
    modified = true;
  }
  
  if (!packageJson.scripts['build:functions']) {
    packageJson.scripts['build:functions'] = "mkdir -p api && cp -r server/* api/ && cp shared/* api/";
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${COLORS.green}Updated build scripts in package.json.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.green}Build scripts already configured in package.json.${COLORS.reset}`);
  }
  
  return true;
}

// Create a deployment guide
function createDeploymentGuide() {
  console.log(`${COLORS.cyan}Creating deployment guide...${COLORS.reset}`);
  
  const guidePath = path.join(rootDir, 'NETLIFY_DEPLOYMENT_GUIDE.md');
  const guideContent = `# Netlify Deployment Guide

## Prerequisites
1. A Supabase account with a project set up
2. Netlify account and Netlify CLI installed (\`npm install -g netlify-cli\`)

## Environment Variables
Set the following environment variables in Netlify:

- \`DATABASE_URL\`: Your Supabase PostgreSQL connection string
  - Format: \`postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres\`

## Deployment Steps

### 1. Build your application for Netlify

\`\`\`bash
npm run build:netlify
\`\`\`

### 2. Deploy to Netlify using the CLI

First, log in to Netlify:

\`\`\`bash
netlify login
\`\`\`

Initialize your site (first-time only):

\`\`\`bash
netlify init
\`\`\`

Deploy to production:

\`\`\`bash
netlify deploy --prod
\`\`\`

### 3. Configure environment variables in Netlify

After deploying, add your environment variables in the Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add your \`DATABASE_URL\` and any other secrets

## Troubleshooting

### Database Connection Issues
- Ensure your Supabase database allows connections from Netlify's IP addresses
- Check that your connection string is correct in the environment variables
- Review Netlify function logs for database connection errors

### Build Errors
- Check the build logs in Netlify for specific error messages
- Ensure all dependencies are properly installed
- Verify that the build commands are correctly configured

### Runtime Errors
- Use Netlify function logs to diagnose API issues
- Check browser console for client-side errors
`;

  fs.writeFileSync(guidePath, guideContent);
  console.log(`${COLORS.green}Created NETLIFY_DEPLOYMENT_GUIDE.md with detailed instructions.${COLORS.reset}`);
  return true;
}

// Main migration function
async function runMigration() {
  console.log(`${COLORS.bold}${COLORS.cyan}=== Supabase Migration Tool ===\n${COLORS.reset}`);
  
  try {
    // Step 1: Check Database URL
    await checkDatabaseUrl();
    console.log(); // Add spacing between steps
    
    // Step 2: Update storage implementation
    if (!updateStorageImplementation()) {
      return;
    }
    console.log();
    
    // Step 3: Run schema migration
    if (!await runSchemaMigration()) {
      return;
    }
    console.log();
    
    // Step 4: Test database connection
    if (!await testDatabaseConnection()) {
      return;
    }
    console.log();
    
    // Step 5: Seed database
    if (!await seedDatabase()) {
      return;
    }
    console.log();
    
    // Step 6: Update build scripts for Netlify
    if (!await updateBuildScripts()) {
      return;
    }
    console.log();
    
    // Step 7: Setup Netlify configuration
    if (!await setupNetlifyConfig()) {
      return;
    }
    console.log();
    
    // Step 8: Create deployment guide
    createDeploymentGuide();
    console.log();
    
    // All done!
    console.log(`${COLORS.bold}${COLORS.green}=== Migration completed successfully! ===\n${COLORS.reset}`);
    console.log(`${COLORS.cyan}Next steps:${COLORS.reset}`);
    console.log(`1. Start your application to verify it works with Supabase: ${COLORS.yellow}npm run dev${COLORS.reset}`);
    console.log(`2. Follow the Netlify deployment guide: ${COLORS.yellow}NETLIFY_DEPLOYMENT_GUIDE.md${COLORS.reset}`);
    console.log(`3. If you encounter any issues, check database logs and connection settings`);
    console.log();
    console.log(`${COLORS.magenta}Happy coding! 🚀${COLORS.reset}`);
    
  } catch (error) {
    console.error(`${COLORS.red}Migration failed with error:${COLORS.reset}`, error);
  } finally {
    rl.close();
  }
}

// Run the migration
runMigration();