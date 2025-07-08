/**
 * File copier utility for Java files
 * Note: As per requirements, copied files should not be committed
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class FileCopier {
  constructor() {
    this.copiedFiles = [];
  }

  async copyJavaFiles(sourcePath, targetPath, options = {}) {
    const {
      includeTests = false,
      preserveStructure = true,
      filter = null
    } = options;

    try {
      logger.info(`Copying Java files from ${sourcePath} to ${targetPath}`);

      const javaFiles = await this._findJavaFiles(sourcePath, includeTests);
      const results = [];

      for (const file of javaFiles) {
        try {
          const targetFile = this._calculateTargetPath(file, sourcePath, targetPath, preserveStructure);

          if (filter && !filter(file.path)) {
            continue;
          }

          await fs.ensureDir(path.dirname(targetFile));
          await fs.copy(file.path, targetFile);

          const result = {
            source: file.path,
            target: targetFile,
            size: file.size,
            success: true
          };

          results.push(result);
          this.copiedFiles.push(result);

          logger.info(`Copied: ${file.path} -> ${targetFile}`);
        } catch (error) {
          logger.error(`Error copying ${file.path}: ${error.message}`);
          results.push({
            source: file.path,
            error: error.message,
            success: false
          });
        }
      }

      return {
        success: true,
        copied: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      logger.error(`Error in copyJavaFiles: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async _findJavaFiles(sourcePath, includeTests) {
    const files = [];

    const processDirectory = async (dirPath) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip certain directories
          if (entry.name === 'target' || entry.name === 'node_modules' || entry.name === '.git') {
            continue;
          }

          // Skip test directories if not including tests
          if (!includeTests && (entry.name === 'test' || entry.name === 'tests')) {
            continue;
          }

          await processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.java')) {
          const stats = await fs.stat(fullPath);
          files.push({
            name: entry.name,
            path: fullPath,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
    };

    await processDirectory(sourcePath);
    return files;
  }

  _calculateTargetPath(file, sourcePath, targetPath, preserveStructure) {
    if (!preserveStructure) {
      return path.join(targetPath, file.name);
    }

    const relativePath = path.relative(sourcePath, file.path);
    return path.join(targetPath, relativePath);
  }

  async copyWithTransformation(sourcePath, targetPath, transformer) {
    try {
      const content = await fs.readFile(sourcePath, 'utf8');
      const transformedContent = await transformer(content, sourcePath);

      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, transformedContent);

      this.copiedFiles.push({
        source: sourcePath,
        target: targetPath,
        transformed: true,
        success: true
      });

      return {
        success: true,
        source: sourcePath,
        target: targetPath
      };
    } catch (error) {
      logger.error(`Error copying with transformation: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getCopiedFiles() {
    return [...this.copiedFiles];
  }

  async cleanup() {
    logger.info('Cleaning up copied files (as per requirements)');

    const results = [];
    for (const copied of this.copiedFiles) {
      try {
        if (await fs.pathExists(copied.target)) {
          await fs.remove(copied.target);
          results.push({
            file: copied.target,
            success: true
          });
        }
      } catch (error) {
        results.push({
          file: copied.target,
          error: error.message,
          success: false
        });
      }
    }

    this.copiedFiles = [];
    return results;
  }
}

module.exports = FileCopier;
