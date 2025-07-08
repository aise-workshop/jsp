const fs = require('fs');
const path = require('path');

/**
 * Basic file system tools for the AI Agent
 */
class FileSystemTools {
  /**
   * List directory contents
   * @param {string} dirPath - Directory path to list
   * @returns {Array} Array of file/directory names
   */
  static list_dir(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      return items.map(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        return {
          name: item,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile()
        };
      });
    } catch (error) {
      console.error(`Error listing directory ${dirPath}:`, error.message);
      return [];
    }
  }

  /**
   * Read file contents
   * @param {string} filePath - File path to read
   * @returns {string|null} File contents or null if error
   */
  static read_file(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Write file contents
   * @param {string} filePath - File path to write
   * @param {string} content - Content to write
   * @returns {boolean} Success status
   */
  static write_file(filePath, content) {
    try {
      // Create directory if it doesn't exist
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Check if path exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if path exists
   */
  static exists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Copy file from source to destination
   * @param {string} srcPath - Source file path
   * @param {string} destPath - Destination file path
   * @returns {boolean} Success status
   */
  static copy_file(srcPath, destPath) {
    try {
      const content = this.read_file(srcPath);
      if (content !== null) {
        return this.write_file(destPath, content);
      }
      return false;
    } catch (error) {
      console.error(`Error copying file ${srcPath} to ${destPath}:`, error.message);
      return false;
    }
  }
}

module.exports = FileSystemTools;