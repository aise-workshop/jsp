const path = require('path');
const FileSystemTools = require('./tools');

/**
 * Java file copying functionality
 */
class JavaFileCopier {
  constructor(sourceDir, targetDir) {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
  }

  /**
   * Copy all Java files from source to target directory
   * @returns {Array} Array of copied files
   */
  copyJavaFiles() {
    const copiedFiles = [];
    
    try {
      const javaFiles = this.findJavaFiles(this.sourceDir);
      
      for (const javaFile of javaFiles) {
        const relativePath = path.relative(this.sourceDir, javaFile);
        const targetPath = path.join(this.targetDir, relativePath);
        
        if (FileSystemTools.copy_file(javaFile, targetPath)) {
          copiedFiles.push({
            source: javaFile,
            target: targetPath,
            relativePath: relativePath
          });
          console.log(`Copied: ${relativePath}`);
        } else {
          console.error(`Failed to copy: ${relativePath}`);
        }
      }
      
      return copiedFiles;
    } catch (error) {
      console.error('Error copying Java files:', error.message);
      return [];
    }
  }

  /**
   * Find all Java files in a directory recursively
   * @param {string} dirPath - Directory to search
   * @returns {Array} Array of Java file paths
   */
  findJavaFiles(dirPath) {
    const javaFiles = [];
    
    if (!FileSystemTools.exists(dirPath)) {
      return javaFiles;
    }
    
    const items = FileSystemTools.list_dir(dirPath);
    
    for (const item of items) {
      if (item.isDirectory) {
        // Recursively search subdirectories
        javaFiles.push(...this.findJavaFiles(item.path));
      } else if (item.isFile && item.name.endsWith('.java')) {
        javaFiles.push(item.path);
      }
    }
    
    return javaFiles;
  }

  /**
   * Get statistics about Java files
   * @returns {Object} Statistics object
   */
  getJavaFileStats() {
    const javaFiles = this.findJavaFiles(this.sourceDir);
    
    return {
      totalFiles: javaFiles.length,
      files: javaFiles.map(filePath => ({
        path: filePath,
        relativePath: path.relative(this.sourceDir, filePath)
      }))
    };
  }
}

module.exports = JavaFileCopier;