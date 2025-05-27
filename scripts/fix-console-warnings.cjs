/**
 * This script adds ESLint disable comments for console statements in the codebase.
 * It's a utility script that should be run as needed, not part of the main application.
 */

const fs = require('fs');
const path = require('path');

// Simple logger for scripts
const logger = {
  info: (...args) => process.stdout.write(`[INFO] ${args.join(' ')}\n`),
  warn: (...args) => process.stderr.write(`[WARN] ${args.join(' ')}\n`),
  error: (...args) => process.stderr.write(`[ERROR] ${args.join(' ')}\n`),
  debug: (...args) => process.stderr.write(`[DEBUG] ${args.join(' ')}\n`)
};

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Console methods to handle
const CONSOLE_METHODS = ['log', 'warn', 'error', 'info', 'debug'];

/**
 * Process a single file to add ESLint disable comments for console statements
 * @param {string} filePath - Path to the file to process
 * @returns {number} 1 if file was modified, 0 otherwise
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Create a pattern to match console methods
    const consolePattern = new RegExp(
      `(\\s*)(console\\.(${CONSOLE_METHODS.join('|')})\\s*\\([^)]*\\))`,
      'g'
    );

    // Replace each console statement with a commented version
    const newContent = content.replace(consolePattern, (match, indent, consoleCall) => {
      // Skip if already has the comment
      const lines = content.split('\n');
      const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
      const prevLine = lines[lineIndex - 1] || '';
      
      if (prevLine.includes('eslint-disable-next-line no-console')) {
        return match;
      }
      
      modified = true;
      return `${indent}// eslint-disable-next-line no-console\n${indent}${consoleCall}`;
    });

    // Write the file back if it was modified
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      logger.info(`Updated: ${path.relative(process.cwd(), filePath)}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    logger.error(`Error processing file ${filePath}: ${error.message}`);
    if (error.stack) {
      logger.debug(error.stack);
    }
    return 0;
  }
}

/**
 * Recursively process all files in a directory
 * @param {string} directory - Directory path to process
 * @returns {number} Total number of files updated
 */
function processDirectory(directory) {
  try {
    let filesUpdated = 0;
    
    // Read the directory
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      try {
        if (entry.isDirectory()) {
          // Skip node_modules and other common directories
          if (['node_modules', '.git', 'dist', 'build', '.next', '.vercel'].includes(entry.name)) {
            continue;
          }
          filesUpdated += processDirectory(fullPath);
        } else if (FILE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
          filesUpdated += processFile(fullPath);
        }
      } catch (error) {
        logger.error(`Error processing entry ${fullPath}: ${error.message}`);
        if (error.stack) {
          logger.debug(error.stack);
        }
      }
    }
    
    return filesUpdated;
  } catch (error) {
    logger.error(`Error reading directory ${directory}: ${error.message}`);
    if (error.stack) {
      logger.debug(error.stack);
    }
    return 0;
  }
}

/**
 * Main function to run the script
 */
function main() {
  logger.info('Adding eslint-disable comments for console statements...');
  
  try {
    const targetDir = process.argv[2] || path.join(__dirname, '../client/src');
    const filesUpdated = processDirectory(targetDir);
    
    if (filesUpdated > 0) {
      logger.info(`✅ Process completed. Successfully updated ${filesUpdated} files.`);
    } else {
      logger.info('✅ Process completed. No files needed updating.');
    }
    logger.info('Please review the changes and commit them if they look good.');
  } catch (error) {
    logger.error(`Error in main execution: ${error.message}`);
    if (error.stack) {
      logger.debug(error.stack);
    }
    process.exit(1);
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  main();
}
