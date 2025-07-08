const path = require('path');
const chalk = require('chalk');
const AIAgent = require('../lib/ai-agent');

/**
 * Main JSP to Spring Boot Converter
 */
class JSPConverter {
  constructor(options = {}) {
    this.sourcePath = options.source || path.join(__dirname, '../test/_fixtures/blog');
    this.targetPath = options.target || path.join(__dirname, '../target');
    this.verbose = options.verbose || false;
    this.agent = new AIAgent({ verbose: this.verbose });
  }

  /**
   * Start the conversion process
   */
  async convert() {
    console.log(chalk.blue.bold('JSP to Spring Boot Converter'));
    console.log(chalk.gray('================================'));
    
    try {
      // Validate paths
      await this.validatePaths();
      
      // Run the AI agent
      const result = await this.agent.convert(this.sourcePath, this.targetPath);
      
      if (result.success) {
        console.log(chalk.green.bold('✓ Conversion completed successfully!'));
        console.log(chalk.gray(`Source: ${this.sourcePath}`));
        console.log(chalk.gray(`Target: ${this.targetPath}`));
      } else {
        console.log(chalk.red.bold('✗ Conversion failed!'));
        console.log(chalk.red(result.message));
      }
      
    } catch (error) {
      console.log(chalk.red.bold('✗ Conversion failed!'));
      console.log(chalk.red(error.message));
    }
  }

  /**
   * Validate source and target paths
   */
  async validatePaths() {
    const fs = require('fs-extra');
    
    if (!await fs.pathExists(this.sourcePath)) {
      throw new Error(`Source path does not exist: ${this.sourcePath}`);
    }
    
    // Create target directory if it doesn't exist
    await fs.ensureDir(this.targetPath);
    
    console.log(chalk.green('✓ Paths validated'));
  }
}

module.exports = JSPConverter;