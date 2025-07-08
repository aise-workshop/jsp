/**
 * Core tools for the AI Agent
 * Provides basic file system operations and utilities
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class Tool {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  async execute(params) {
    throw new Error('Tool execute method must be implemented');
  }
}

class ListDirTool extends Tool {
  constructor() {
    super('list_dir', 'List contents of a directory');
  }

  async execute({ dirPath, recursive = false, filter = null }) {
    try {
      logger.info(`Listing directory: ${dirPath}`);
      
      if (!await fs.pathExists(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`);
      }

      const items = [];
      
      if (recursive) {
        await this._listRecursive(dirPath, items, filter);
      } else {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!filter || filter(entry.name)) {
            items.push({
              name: entry.name,
              path: path.join(dirPath, entry.name),
              type: entry.isDirectory() ? 'directory' : 'file',
              size: entry.isFile() ? (await fs.stat(path.join(dirPath, entry.name))).size : null
            });
          }
        }
      }

      return {
        success: true,
        items,
        count: items.length
      };
    } catch (error) {
      logger.error(`Error listing directory: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async _listRecursive(dirPath, items, filter) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (!filter || filter(entry.name)) {
        items.push({
          name: entry.name,
          path: fullPath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: entry.isFile() ? (await fs.stat(fullPath)).size : null
        });
      }

      if (entry.isDirectory()) {
        await this._listRecursive(fullPath, items, filter);
      }
    }
  }
}

class ReadFileTool extends Tool {
  constructor() {
    super('read_file', 'Read contents of a file');
  }

  async execute({ filePath, encoding = 'utf8' }) {
    try {
      logger.info(`Reading file: ${filePath}`);
      
      if (!await fs.pathExists(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
      }

      const content = await fs.readFile(filePath, encoding);
      
      return {
        success: true,
        content,
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      logger.error(`Error reading file: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

class WriteFileTool extends Tool {
  constructor() {
    super('write_file', 'Write content to a file');
  }

  async execute({ filePath, content, encoding = 'utf8', createDirs = true }) {
    try {
      logger.info(`Writing file: ${filePath}`);
      
      if (createDirs) {
        await fs.ensureDir(path.dirname(filePath));
      }

      await fs.writeFile(filePath, content, encoding);
      
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        created: stats.birthtime
      };
    } catch (error) {
      logger.error(`Error writing file: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  Tool,
  ListDirTool,
  ReadFileTool,
  WriteFileTool
};