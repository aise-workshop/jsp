const fs = require('fs-extra');
const path = require('path');

/**
 * Basic file system tools for the AI Agent
 */
class FileSystemTools {
  constructor() {
    this.tools = {
      list_dir: this.listDirectory.bind(this),
      read_file: this.readFile.bind(this),
      write_file: this.writeFile.bind(this)
    };
  }

  /**
   * List files and directories in a given path
   * @param {string} dirPath - Directory path to list
   * @returns {Promise<Array>} Array of files and directories
   */
  async listDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      const result = [];
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await fs.stat(fullPath);
        result.push({
          name: item,
          path: fullPath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to list directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Read file content
   * @param {string} filePath - File path to read
   * @returns {Promise<string>} File content
   */
  async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write content to file
   * @param {string} filePath - File path to write
   * @param {string} content - Content to write
   * @returns {Promise<void>}
   */
  async writeFile(filePath, content) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Copy file from source to destination
   * @param {string} sourcePath - Source file path
   * @param {string} destPath - Destination file path
   * @returns {Promise<void>}
   */
  async copyFile(sourcePath, destPath) {
    try {
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(sourcePath, destPath);
    } catch (error) {
      throw new Error(`Failed to copy file ${sourcePath} to ${destPath}: ${error.message}`);
    }
  }

  /**
   * Check if path exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = FileSystemTools;