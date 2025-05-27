const fs = require("fs").promises;
const path = require("path");

// Directory to search for files
const SRC_DIR = path.join(__dirname, "../client/src");

// File extensions to process
const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

// Console methods to handle
const CONSOLE_METHODS = ["log", "warn", "error", "info", "debug"];

/**
 * Process a single file to add ESLint disable comments for console statements
 * @param {string} filePath - Path to the file to process
 * @returns {Promise<number>} 1 if file was modified, 0 otherwise
 */
async function processFile(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  let modified = false;

  // Create a pattern to match console methods
  const consolePattern = new RegExp(
    `(\\s*)(console\\.(${CONSOLE_METHODS.join("|")})\\s*\\([^)]*\\))`,
    "g",
  );

  // Replace each console statement with a commented version
  const newContent = content.replace(
    consolePattern,
    (match, indent, consoleCall) => {
      // Skip if already has the comment
      const lines = content.split("\n");
      const lineIndex =
        content.substring(0, content.indexOf(match)).split("\n").length - 1;
      const prevLine = lines[lineIndex - 1] || "";

      if (prevLine.includes("eslint-disable-next-line no-console")) {
        return match;
      }

      modified = true;
      return `${indent}// eslint-disable-next-line no-console\n${indent}${consoleCall}`;
    },
  );

  // Write the file back if it was modified
  if (modified) {
    fs.writeFileSync(filePath, newContent, "utf8");
     
    console.info(`Updated: ${path.relative(process.cwd(), filePath)}`);
    return 1;
  }

  return 0;
}

/**
 * Recursively process all files in a directory
 * @param {string} directory - Directory to process
 * @returns {Promise<number>} Number of files updated
 */
async function processDirectory(directory) {
  let count = 0;

  const files = await fs.readdir(directory);

  // Process files in parallel
  await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(directory, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        count += await processDirectory(fullPath);
      } else if (FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
        count += await processFile(fullPath);
      }
    }),
  );

  return count;
}

/**
 * Main function to run the script
 */
async function main() {
  // Using console.info as it's an allowed console method
  console.info("Adding eslint-disable comments for console statements...");
  const filesUpdated = await processDirectory(SRC_DIR);
  console.info(`\n✅ Process completed. Updated ${filesUpdated} files.`);
}

// Run the script
main().catch((error) => {
   
  console.error("Error:", error);
  process.exit(1);
});
