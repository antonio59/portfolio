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

/**
 * Process a single file
 * @param {string} filePath - Path to the file to process
 * @returns {number} Number of files modified
 */
function processFile(/** @type {string} */ filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove duplicate eslint-disable comments
  const cleanedContent = content.replace(
    /(\/\/\s*eslint-disable-next-line\s+no-console\s*\n\s*\/\/\s*eslint-disable-next-line\s+no-console\s*\n)/g, 
    '// eslint-disable-next-line no-console\n'
  );

  // Write the file back if it was modified
  if (cleanedContent !== content) {
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log(`Cleaned: ${path.relative(process.cwd(), filePath)}`);
    return 1;
  }
  
  return 0;
}

/**
 * Recursively process all files in a directory
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

// Run the script
console.log('Cleaning up duplicate eslint-disable comments...');
const filesUpdated = processDirectory(SRC_DIR);
console.log(`\n✅ Process completed. Cleaned ${filesUpdated} files.`);
