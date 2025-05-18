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

// Check if DATABASE_URL environment variable is set
async function checkDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    console.log(`${COLORS.yellow}DATABASE_URL environment variable is not set.${COLORS.reset}`);
    console.log(`${COLORS.cyan}Please enter your Supabase PostgreSQL connection string:${COLORS.reset}`);
    console.log(`${COLORS.white}Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres${COLORS.reset}`);
    
    const databaseUrl = await prompt('> ');
    
    if (!databaseUrl) {
      console.error(`${COLORS.red}No database URL provided. Aborting.${COLORS.reset}`);
      rl.close();
      process.exit(1);
    }
    
    // Set the environment variable for the current process
    process.env.DATABASE_URL = databaseUrl;
    
    // Ask if they want to save this to .env
    const saveToEnv = await prompt(`${COLORS.yellow}Would you like to save this DATABASE_URL to .env file? (y/n)${COLORS.reset} `);
    if (saveToEnv.toLowerCase() === 'y') {
      try {
        let envContent = '';
        if (fs.existsSync('.env')) {
          envContent = fs.readFileSync('.env', 'utf8');
        }
        
        // Replace or add DATABASE_URL
        if (envContent.includes('DATABASE_URL=')) {
          envContent = envContent.replace(/DATABASE_URL=.*(\r?\n|$)/g, `DATABASE_URL="${databaseUrl}"$1`);
        } else {
          envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
        }
        
        fs.writeFileSync('.env', envContent);
        console.log(`${COLORS.green}DATABASE_URL saved to .env file.${COLORS.reset}`);
      } catch (error) {
        console.error(`${COLORS.red}Error saving to .env file:${COLORS.reset}`, error.message);
      }
    }
  }
  
  return process.env.DATABASE_URL;
}

// Test database connection
async function testConnection() {
  console.log(`${COLORS.cyan}Testing connection to Supabase PostgreSQL...${COLORS.reset}`);
  
  try {
    const output = execSync('npx drizzle-kit introspect:pg', { 
      stdio: ['pipe', 'pipe', 'pipe'], 
      encoding: 'utf-8',
      env: process.env
    });
    
    console.log(`${COLORS.green}Successfully connected to database!${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Failed to connect to database:${COLORS.reset}`, error.message);
    
    // Offer troubleshooting advice
    console.log(`${COLORS.yellow}Troubleshooting tips:${COLORS.reset}`);
    console.log('1. Check that your Supabase project is running');
    console.log('2. Verify your database password is correct');
    console.log('3. Make sure your IP address is allowed in Supabase');
    console.log('4. Check if the database URL format is correct');
    
    const retry = await prompt(`${COLORS.yellow}Would you like to retry with a different DATABASE_URL? (y/n)${COLORS.reset} `);
    if (retry.toLowerCase() === 'y') {
      delete process.env.DATABASE_URL;
      await checkDatabaseUrl();
      return testConnection();
    }
    
    return false;
  }
}

// Run Drizzle Push to create/update schema
async function pushSchema() {
  console.log(`${COLORS.cyan}Pushing schema to Supabase...${COLORS.reset}`);
  
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log(`${COLORS.green}Schema successfully pushed to database!${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Failed to push schema:${COLORS.reset}`, error.message);
    
    const retry = await prompt(`${COLORS.yellow}Would you like to retry? (y/n)${COLORS.reset} `);
    if (retry.toLowerCase() === 'y') {
      return pushSchema();
    }
    
    return false;
  }
}

// Run database seeds
async function seedDatabase() {
  console.log(`${COLORS.cyan}Seeding database with initial data...${COLORS.reset}`);
  
  const confirmSeed = await prompt(`${COLORS.yellow}Do you want to seed the database with initial data? (y/n)${COLORS.reset} `);
  if (confirmSeed.toLowerCase() !== 'y') {
    console.log(`${COLORS.yellow}Skipping database seeding.${COLORS.reset}`);
    return true;
  }
  
  try {
    execSync('npx tsx server/seed.ts', { stdio: 'inherit' });
    console.log(`${COLORS.green}Database successfully seeded!${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Failed to seed database:${COLORS.reset}`, error.message);
    
    const retry = await prompt(`${COLORS.yellow}Would you like to retry? (y/n)${COLORS.reset} `);
    if (retry.toLowerCase() === 'y') {
      return seedDatabase();
    }
    
    return false;
  }
}

// Check Supabase Storage implementation
async function checkSupabaseStorage() {
  console.log(`${COLORS.cyan}Checking Supabase storage implementation...${COLORS.reset}`);
  
  // Check if supabase-storage.ts exists
  if (!fs.existsSync('server/supabase-storage.ts')) {
    console.error(`${COLORS.red}server/supabase-storage.ts not found. Cannot proceed.${COLORS.reset}`);
    return false;
  }
  
  // Check if storage.ts is configured to use Supabase
  const storageContent = fs.readFileSync('server/storage.ts', 'utf8');
  if (!storageContent.includes('import { SupabaseStorage }') || 
      !storageContent.includes('export let storage: IStorage = new SupabaseStorage();')) {
    
    console.log(`${COLORS.yellow}server/storage.ts is not configured to use Supabase.${COLORS.reset}`);
    
    const updateStorage = await prompt(`${COLORS.yellow}Would you like to update it to use Supabase? (y/n)${COLORS.reset} `);
    if (updateStorage.toLowerCase() === 'y') {
      let updatedContent = storageContent;
      
      // Add import if needed
      if (!updatedContent.includes('import { SupabaseStorage }')) {
        updatedContent = updatedContent.replace(
          'import { MemStorage } from', 
          'import { SupabaseStorage } from "./supabase-storage";\nimport { MemStorage } from'
        );
      }
      
      // Update storage instance
      updatedContent = updatedContent.replace(
        'export let storage: IStorage = new MemStorage();',
        '// export let storage: IStorage = new MemStorage();\nexport let storage: IStorage = new SupabaseStorage();'
      );
      
      fs.writeFileSync('server/storage.ts', updatedContent);
      console.log(`${COLORS.green}Updated server/storage.ts to use Supabase.${COLORS.reset}`);
    } else {
      console.log(`${COLORS.yellow}Skipping storage update. You'll need to update it manually.${COLORS.reset}`);
    }
  } else {
    console.log(`${COLORS.green}server/storage.ts is already configured to use Supabase.${COLORS.reset}`);
  }
  
  return true;
}

// Main function
async function main() {
  console.log(`${COLORS.bold}${COLORS.cyan}=== Supabase Schema Setup Tool ===\n${COLORS.reset}`);
  
  try {
    // Step 1: Check DATABASE_URL
    await checkDatabaseUrl();
    console.log(); // Spacing between steps
    
    // Step 2: Test connection
    if (!await testConnection()) {
      console.log(`${COLORS.red}Connection failed. Please check your database credentials and try again.${COLORS.reset}`);
      rl.close();
      return;
    }
    console.log();
    
    // Step 3: Check Supabase Storage implementation
    if (!await checkSupabaseStorage()) {
      console.log(`${COLORS.red}Cannot find Supabase storage implementation. Aborting.${COLORS.reset}`);
      rl.close();
      return;
    }
    console.log();
    
    // Step 4: Push schema
    if (!await pushSchema()) {
      console.log(`${COLORS.yellow}Schema push was not completed. You can try again later with 'npm run db:push'.${COLORS.reset}`);
    }
    console.log();
    
    // Step 5: Seed database
    if (!await seedDatabase()) {
      console.log(`${COLORS.yellow}Database seeding was not completed. You can try again later with 'npx tsx server/seed.ts'.${COLORS.reset}`);
    }
    console.log();
    
    // All done!
    console.log(`${COLORS.bold}${COLORS.green}=== Supabase Setup Completed ===\n${COLORS.reset}`);
    console.log(`${COLORS.cyan}Your application is now configured to use Supabase PostgreSQL.${COLORS.reset}`);
    console.log(`${COLORS.cyan}You can start your application with:${COLORS.reset} npm run dev`);
    
  } catch (error) {
    console.error(`${COLORS.red}An error occurred:${COLORS.reset}`, error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();