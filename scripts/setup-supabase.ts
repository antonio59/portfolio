#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and return a promise
function question(query: string): Promise<string> {
  console.log(query);
  return new Promise((resolve) => rl.question("", resolve));
}

// Function to run shell commands
function runCommand(command: string, cwd: string = process.cwd()): boolean {
  console.log(`🚀 Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit", cwd });
    return true;
  } catch (error: unknown) {
    console.error(`❌ Error running command: ${command}`);
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
}

// Main function
async function setupSupabase(): Promise<void> {
  console.log("🚀 Setting up Supabase for your portfolio...\n");

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
    console.log("✅ Found .env.local");
  } else {
    console.log("⚠️  .env.local not found. Creating one...");
  }

  // Get Supabase URL and anon key
  let supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl) {
    supabaseUrl = await question(
      "🔑 Enter your Supabase URL (e.g., https://xxxxxxxxxxxxxxxxx.supabase.co): ",
    );
  }

  if (!supabaseAnonKey) {
    supabaseAnonKey = await question(
      "🔑 Enter your Supabase anon/public key: ",
    );
  }

  // Update .env.local
  let updatedEnvContent = envContent;

  if (!updatedEnvContent.includes("VITE_SUPABASE_URL")) {
    updatedEnvContent += `\nVITE_SUPABASE_URL=${supabaseUrl}\n`;
  } else {
    updatedEnvContent = updatedEnvContent.replace(
      /VITE_SUPABASE_URL=.*/,
      `VITE_SUPABASE_URL=${supabaseUrl}`,
    );
  }

  if (!updatedEnvContent.includes("VITE_SUPABASE_ANON_KEY")) {
    updatedEnvContent += `VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}\n`;
  } else {
    updatedEnvContent = updatedEnvContent.replace(
      /VITE_SUPABASE_ANON_KEY=.*/,
      `VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
    );
  }

  // Write the updated .env.local
  fs.writeFileSync(envPath, updatedEnvContent.trim() + "\n");
  console.log("✅ Updated .env.local with Supabase credentials");

  // Check if Supabase project is already linked
  console.log("\n🔗 Checking Supabase project link...");
  try {
    execSync("supabase status", { stdio: "ignore" });
    console.log("✅ Supabase project is already linked");
  } catch {
    // Error is expected here if the project is not linked yet
    console.log("Linking Supabase project...");
    const projectRef = supabaseUrl.split("/").pop() || "";
    if (!projectRef) {
      console.error("❌ Could not extract project reference from Supabase URL");
      process.exit(1);
    }
    runCommand(`supabase link --project-ref ${projectRef}`);
  }

  // Install Supabase CLI if not already installed
  console.log("\n🔍 Checking for Supabase CLI...");
  try {
    execSync("supabase --version", { stdio: "ignore" });
    console.log("✅ Supabase CLI is already installed");
  } catch {
    console.log("Installing Supabase CLI...");
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    execSync(`${npmCmd} install -g supabase`, { stdio: "inherit" });
  }

  // Initialize Supabase if not already initialized
  const supabaseDir = path.join(process.cwd(), "supabase");
  if (!fs.existsSync(path.join(supabaseDir, "config.toml"))) {
    console.log("\n🚀 Initializing Supabase...");
    runCommand("supabase init");
  } else {
    console.log("✅ Supabase already initialized");
  }

  // Start Supabase services
  console.log("\n🚀 Starting Supabase services...");
  if (!runCommand("supabase start")) {
    console.error("❌ Failed to start Supabase services");
    process.exit(1);
  }

  // Get the generated credentials
  const credentials = execSync("supabase status --json", { encoding: "utf8" });
  const { dbUrl, anonKey, serviceRoleKey } = JSON.parse(credentials);

  // Update .env.local with the generated credentials
  let updatedEnv = fs.readFileSync(envPath, "utf8");

  // Update or add each environment variable
  const envUpdates: Record<string, string> = {
    DATABASE_URL: dbUrl,
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  };

  for (const [key, value] of Object.entries(envUpdates)) {
    if (updatedEnv.includes(`${key}=`)) {
      updatedEnv = updatedEnv.replace(
        new RegExp(`^${key}=.*$`, "m"),
        `${key}=${value}`,
      );
    } else {
      updatedEnv += `\n${key}=${value}\n`;
    }
  }

  fs.writeFileSync(envPath, updatedEnv.trim() + "\n");
  console.log("✅ Updated .env.local with Supabase credentials");

  // Link to your Supabase project
  console.log("\n🔗 Linking to your Supabase project...");
  const projectRef = await question(
    "Enter your Supabase project reference ID (or press Enter to skip): ",
  );

  if (projectRef) {
    runCommand(`supabase link --project-ref ${projectRef}`);

    // Pull the schema from the remote project
    console.log("\n📥 Pulling schema from Supabase...");
    runCommand("supabase db pull");
    console.log("✅ Successfully pulled schema from remote project");
  } else {
    console.log(
      "\n⚠️  Skipping project linking. You can link later with: supabase link --project-ref YOUR_PROJECT_REF",
    );
  }

  console.log("\n🎉 Setup completed successfully!\n");
  console.log("Next steps:");
  console.log("1. Run `supabase start` to start the local Supabase stack");
  console.log(
    "2. Run `supabase db push` to push your local schema changes to Supabase",
  );
  console.log(
    "3. Run `supabase functions serve` to test your Edge Functions locally",
  );
  console.log(
    "4. Run `supabase gen types typescript --local` to generate TypeScript types",
  );
  console.log(
    "\nFor more information, visit: https://supabase.com/docs/guides/local-development",
  );
}

// Run the setup
setupSupabase().catch((error: unknown) => {
  console.error("❌ An error occurred during setup:");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("An unknown error occurred");
  }
  // Close readline interface if it exists
  if (rl) {
    rl.close();
  }
  process.exit(1);
});
