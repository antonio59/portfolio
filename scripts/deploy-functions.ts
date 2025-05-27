#!/usr/bin/env node

import { execSync, ExecSyncOptions } from "child_process";
import fs from "fs";
import path from "path";
import { createInterface } from "readline";

// Logger utility
const logger = {
  info: (message: string): void => {
    // Using process.stdout.write to avoid ESLint no-console
    process.stdout.write(`ℹ️ ${message}\n`);
  },
  success: (message: string): void => {
    process.stdout.write(`✅ ${message}\n`);
  },
  warn: (message: string): void => {
    process.stderr.write(`⚠️ ${message}\n`);
  },
  error: (message: string, error: unknown = ""): void => {
    process.stderr.write(`❌ ${message} ${String(error)}\n`);
  },
};

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and return a promise
const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

// Function to run shell commands
const runCommand = (
  command: string,
  cwd = process.cwd(),
): { success: boolean; output?: Buffer | string } => {
  logger.info(`Running: ${command}`);
  const options: ExecSyncOptions = {
    stdio: "pipe", // Changed from 'inherit' to 'pipe' to capture output
    cwd,
    encoding: "buffer", // Explicitly set encoding to buffer
  };

  try {
    const output = execSync(command, options);
    return { success: true, output };
  } catch (error) {
    logger.error(`Error executing command: ${command}`, error);
    return { success: false };
  }
};

// Main function
const deployFunctions = async (): Promise<void> => {
  try {
    logger.info("Starting deployment of Supabase Edge Functions...");

    // Check if supabase is installed
    try {
      execSync("supabase --version", { stdio: "ignore" });
    } catch {
      logger.error(
        "Supabase CLI is not installed. Please install it first: https://supabase.com/docs/guides/cli",
      );
      process.exit(1);
    }

    // Check if user is logged in
    try {
      execSync("supabase status", { stdio: "ignore" });
    } catch {
      logger.error("Please login to Supabase CLI first: supabase login");
      process.exit(1);
    }

    // Get the list of functions
    const functionsDir = path.join(process.cwd(), "supabase", "functions");
    if (!fs.existsSync(functionsDir)) {
      logger.error(`Functions directory not found at: ${functionsDir}`);
      process.exit(1);
    }

    const functions = fs
      .readdirSync(functionsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (functions.length === 0) {
      logger.error("No functions found to deploy");
      process.exit(1);
    }

    logger.info(`Found functions: ${functions.join(", ")}`);

    // Deploy each function
    for (const func of functions) {
      logger.info(`Deploying function: ${func}`);
      const functionPath = path.join(functionsDir, func);
      const { success } = runCommand(
        `supabase functions deploy ${func}`,
        functionPath,
      );

      if (!success) {
        logger.warn(`Failed to deploy function: ${func}`);
        const shouldContinue = await question(
          "Continue with other functions? (y/n) ",
        );
        if (shouldContinue.toLowerCase() !== "y") {
          break;
        }
      } else {
        logger.success(`Successfully deployed function: ${func}`);
      }
    }

    logger.success("All functions deployed successfully!");
  } catch (error) {
    logger.error("An error occurred during deployment", error);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run the deployment
deployFunctions().catch((error: unknown) => {
  logger.error("An error occurred during deployment", error);
  rl.close();
  process.exit(1);
});
