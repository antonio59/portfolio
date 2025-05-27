// @ts-check
const fs = require("fs");
const path = require("path");

// Directory to search for files
const SRC_DIR = path.join(__dirname, "../client/src");

// File extensions to process
const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/**
 * Process a single file to clean up duplicate ESLint disable comments
 * @param {string} filePath - Path to the file to process
 * @returns {number} 1 if file was modified, 0 otherwise
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Remove duplicate eslint-disable comments
  const cleanedContent = content.replace(
    /(\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*\/\/\s*eslint-disable-next-line\s+no-console\s*\n)/g,
    "// eslint-disable-next-line no-console\n",
  );

  // Write the file back if it was modified
  if (cleanedContent !== content) {
    fs.writeFileSync(filePath, cleanedContent, "utf8");
    // Using console.info as it's an allowed console method
    console.info(`Cleaned: ${path.relative(process.cwd(), filePath)}`);
    return 1;
  }

  return 0;
}

/**
 * Recursively process all files in a directory
 * @param {string} directory - Directory to process
 * @returns {number} Number of files modified
 */
function processDirectory(directory) {
  let count = 0;

  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      count += processFile(fullPath);
    }
  }

  return count;
}

/**
 * Main function to run the script
 */
function main() {
  // Using console.info as it's an allowed console method
  console.info("Cleaning up duplicate eslint-disable comments...");
  const filesUpdated = processDirectory(SRC_DIR);
  console.info(`\n✅ Process completed. Cleaned ${filesUpdated} files.`);
}

// Run the script
main();
