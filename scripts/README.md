# Data Migration Scripts

This directory contains scripts for migrating hardcoded data from the frontend to Supabase.

## migrate-hardcoded-data.ts

This script migrates hardcoded data from `client/src/utils/ProjectData.ts` to your Supabase database.

### Prerequisites

1. Node.js installed
2. Required dependencies installed:
   ```
   npm install @supabase/supabase-js dotenv
   ```
3. Environment variables set in a `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Usage

1. Ensure your Supabase database has the necessary tables (`projects`, `experiences`, `sections`)
2. Run the script:
   ```
   npx ts-node scripts/migrate-hardcoded-data.ts
   ```

### What it does

1. **Projects**: Migrates projects to the `projects` table
2. **Experiences**: Migrates work experiences to the `experiences` table
3. **Education**: Creates an education section in the `sections` table with education items as content

### Notes

- The script uses a default user ID (`00000000-0000-0000-0000-000000000000`) for all data. Update this to a real user ID if needed.
- The script uses `upsert`, so it's safe to run multiple times.
- Make sure to back up your database before running the migration.

### Troubleshooting

- If you get authentication errors, verify your Supabase URL and Anon Key
- Check that your database tables match the expected schema
- Look for error messages in the console output for specific issues
