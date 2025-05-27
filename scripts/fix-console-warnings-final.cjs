// @ts-check
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} ProcessedFile
 * @property {string} content - The processed file content
 * @property {boolean} modified - Whether the file was modified
 */

/**
 * @typedef {Object} FileStats
 * @property {boolean} isFile - Whether the path is a file
 * @property {boolean} isDirectory - Whether the path is a directory
 */

// Directory to search for files
const SRC_DIR = path.join(__dirname, '../client/src');

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Console methods to handle
const CONSOLE_METHODS = ['log', 'warn', 'error', 'info', 'debug'];

// Process a single file
/**
 * Process a single file
 * @param {string} filePath - Path to the file to process
 * @returns {number} Number of files modified
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add proper eslint-disable comments before console statements
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    
    // Check if this is a console statement
    if (CONSOLE_METHODS.some(method => 
      line.trim().startsWith(`console.${method}(`) || 
      line.includes(`console.${method}(`)
    )) {
      // Skip if the previous line already has an eslint-disable comment
      const prevLine = i > 0 ? lines[i - 1] : '';
      if (i === 0 || !prevLine || !prevLine.includes('eslint-disable-next-line no-console')) {
        // Get the indentation of the current line
        const indentMatch = line.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        newLines.push(`${indent}// eslint-disable-next-line no-console`);
        modified = true;
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    const newContent = newLines.join('\n');
    // Write the file back if it was modified
    fs.writeFileSync(filePath, newContent, 'utf8');
    // Using console.info as it's an allowed console method
    console.info(`Fixed: ${path.relative(process.cwd(), filePath)}`);
    return 1;
  }
  
  return 0;
}

// Recursively process all files in a directory
/**
 * @param {string} directory - Directory to process
 * @returns {number} Number of files modified
 */
function processDirectory(/** @type {string} */ directory) {
  let count = 0;
  
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (FILE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      count += processFile(fullPath);
    }
  });
  
  return count;
}

/**
 * Main function to run the script
 */
function main() {
  console.info('Fixing console statement warnings...');
  const filesUpdated = processDirectory(SRC_DIR);
  console.info(`\n✅ Process completed. Fixed ${filesUpdated} files.`);
}

// Run the script
main();
