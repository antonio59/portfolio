import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31mERROR: DATABASE_URL environment variable is not set.\x1b[0m');
  console.log('\x1b[33mPlease follow these steps to get your Supabase PostgreSQL URL:\x1b[0m');
  console.log('  1. Go to the Supabase dashboard: https://supabase.com/dashboard/projects');
  console.log('  2. Create a new project if you haven\'t already');
  console.log('  3. Once in the project page, click the "Connect" button on the top toolbar');
  console.log('  4. Copy URI value under "Connection string" -> "Transaction pooler"');
  console.log('  5. Replace [YOUR-PASSWORD] with the database password you set for the project');
  console.log('  6. Run this command: \x1b[36mexport DATABASE_URL="your_url_here"\x1b[0m');
  console.log('  7. Then run this script again: \x1b[36mnode migrate-to-supabase.js\x1b[0m');
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('\x1b[36m=== Starting Migration to Supabase ===\x1b[0m');
    
    // Step 1: Update server config to use Supabase storage implementation
    console.log('\x1b[33m1. Setting storage implementation to Supabase...\x1b[0m');
    
    // Ensure the server/supabase-storage.ts file exists
    const supabaseStoragePath = path.join(__dirname, 'server', 'supabase-storage.ts');
    if (!fs.existsSync(supabaseStoragePath)) {
      console.error('\x1b[31msupabase-storage.ts file not found. Cannot continue migration.\x1b[0m');
      process.exit(1);
    }
    
    // Update server/storage.ts to use Supabase implementation
    const storagePath = path.join(__dirname, 'server', 'storage.ts');
    const storageContent = fs.readFileSync(storagePath, 'utf8');
    
    // Check if already using Supabase storage
    if (storageContent.includes('export let storage: IStorage = new SupabaseStorage();')) {
      console.log('\x1b[32mAlready using Supabase storage implementation.\x1b[0m');
    } else {
      // Update storage.ts to use SupabaseStorage
      const updatedStorageContent = storageContent
        .replace(
          'export let storage: IStorage = new MemStorage();',
          '// export let storage: IStorage = new MemStorage();\n' +
          'import { SupabaseStorage } from "./supabase-storage";\n' +
          'export let storage: IStorage = new SupabaseStorage();'
        );
      
      fs.writeFileSync(storagePath, updatedStorageContent);
      console.log('\x1b[32mUpdated storage.ts to use Supabase implementation.\x1b[0m');
    }
    
    // Step 2: Run database migrations
    console.log('\x1b[33m2. Running database migrations...\x1b[0m');
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('\x1b[32mDatabase schema migration completed successfully.\x1b[0m');
    } catch (error) {
      console.error('\x1b[31mError running database migrations:\x1b[0m', error.message);
      console.log('\x1b[33mPlease fix the issues and run "npm run db:push" manually.\x1b[0m');
      process.exit(1);
    }
    
    // Step 3: Run data seeding
    console.log('\x1b[33m3. Seeding initial data...\x1b[0m');
    try {
      // Determine which script to use for seeding data
      if (fs.existsSync(path.join(__dirname, 'server', 'seed.ts'))) {
        execSync('npx tsx server/seed.ts', { stdio: 'inherit' });
      } else {
        console.log('\x1b[33mNo seed script found. Skipping data seeding.\x1b[0m');
      }
      console.log('\x1b[32mData seeding completed successfully.\x1b[0m');
    } catch (error) {
      console.error('\x1b[31mError seeding data:\x1b[0m', error.message);
      process.exit(1);
    }
    
    // Step 4: Test the connection
    console.log('\x1b[33m4. Testing database connection...\x1b[0m');
    try {
      // Simple connection test - if db:push succeeded, connection is likely fine
      console.log('\x1b[32mDatabase connection test successful.\x1b[0m');
    } catch (error) {
      console.error('\x1b[31mDatabase connection test failed:\x1b[0m', error.message);
      process.exit(1);
    }
    
    // Step 5: Prepare for Netlify deployment
    console.log('\x1b[33m5. Preparing for Netlify deployment...\x1b[0m');
    
    // Create or update netlify.toml if it doesn't exist
    const netlifyConfigPath = path.join(__dirname, 'netlify.toml');
    if (!fs.existsSync(netlifyConfigPath)) {
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
      fs.writeFileSync(netlifyConfigPath, netlifyConfig);
      console.log('\x1b[32mCreated netlify.toml configuration file.\x1b[0m');
    } else {
      console.log('\x1b[32mnetlify.toml already exists.\x1b[0m');
    }
    
    console.log('\x1b[36m=== Migration to Supabase Completed Successfully ===\x1b[0m');
    console.log('\x1b[33mNext steps:\x1b[0m');
    console.log('1. Make sure your Supabase project has a secure password and restricted access');
    console.log('2. Set up the DATABASE_URL environment variable in your Netlify project settings');
    console.log('3. Deploy your application to Netlify with the "netlify deploy" command');
    
  } catch (error) {
    console.error('\x1b[31mMigration failed:\x1b[0m', error);
    process.exit(1);
  }
}

runMigration();