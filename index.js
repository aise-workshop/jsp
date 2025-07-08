#!/usr/bin/env node

const path = require('path');
const FileSystemTools = require('./tools');
const JavaFileCopier = require('./java-copier');
const AIAgent = require('./ai-agent');

/**
 * Main CLI interface for JSP to Spring Boot conversion
 */
class JSPConverterCLI {
  constructor() {
    this.sourceDir = path.resolve(__dirname, 'test/_fixtures/blog');
    this.targetDir = path.resolve(__dirname, 'target');
  }

  /**
   * Display help information
   */
  showHelp() {
    console.log(`
🔧 JSP to Spring Boot Converter CLI

Usage: node index.js [command] [options]

Commands:
  analyze    - Analyze the source project structure
  convert    - Convert JSP project to Spring Boot
  copy-java  - Copy Java files only
  help       - Show this help message

Options:
  --source   - Source directory (default: test/_fixtures/blog)
  --target   - Target directory (default: target)

Examples:
  node index.js analyze
  node index.js convert
  node index.js copy-java
  node index.js --source ./my-jsp-project --target ./my-spring-boot-project convert
    `);
  }

  /**
   * Parse command line arguments
   * @param {Array} args - Command line arguments
   * @returns {Object} Parsed arguments
   */
  parseArgs(args) {
    const parsed = {
      command: 'help',
      options: {}
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const option = arg.substring(2);
        const value = args[i + 1];
        if (value && !value.startsWith('--')) {
          parsed.options[option] = value;
          i++; // Skip the value in next iteration
        }
      } else if (!arg.startsWith('-')) {
        parsed.command = arg;
      }
    }

    return parsed;
  }

  /**
   * Run the analyze command
   */
  async runAnalyze() {
    console.log('🔍 Analyzing JSP project...');
    console.log(`Source: ${this.sourceDir}`);
    console.log(`Target: ${this.targetDir}`);

    // Check if source directory exists
    if (!FileSystemTools.exists(this.sourceDir)) {
      console.error(`❌ Source directory not found: ${this.sourceDir}`);
      return;
    }

    // Initialize AI Agent
    const agent = new AIAgent();
    const analysis = agent.analyzeProject(this.sourceDir, this.targetDir);

    // Display results
    console.log('\\n📊 Analysis Results:');
    console.log(`  Java files: ${analysis.javaFiles.length}`);
    console.log(`  JSP files: ${analysis.jspFiles.length}`);
    console.log(`  Resource files: ${analysis.resourceFiles.length}`);
    console.log(`  Conversion steps: ${analysis.conversionPlan.length}`);

    // Show some example files
    if (analysis.javaFiles.length > 0) {
      console.log('\\n📁 Java files found:');
      analysis.javaFiles.slice(0, 5).forEach(file => {
        console.log(`  - ${file.replace(this.sourceDir, '')}`);
      });
      if (analysis.javaFiles.length > 5) {
        console.log(`  ... and ${analysis.javaFiles.length - 5} more`);
      }
    }

    if (analysis.jspFiles.length > 0) {
      console.log('\\n📄 JSP files found:');
      analysis.jspFiles.slice(0, 5).forEach(file => {
        console.log(`  - ${file.replace(this.sourceDir, '')}`);
      });
      if (analysis.jspFiles.length > 5) {
        console.log(`  ... and ${analysis.jspFiles.length - 5} more`);
      }
    }
  }

  /**
   * Run the convert command
   */
  async runConvert() {
    console.log('🔄 Converting JSP project to Spring Boot...');
    console.log(`Source: ${this.sourceDir}`);
    console.log(`Target: ${this.targetDir}`);

    // Check if source directory exists
    if (!FileSystemTools.exists(this.sourceDir)) {
      console.error(`❌ Source directory not found: ${this.sourceDir}`);
      return;
    }

    // Initialize AI Agent
    const agent = new AIAgent();
    
    // Step 1: Analyze project
    const analysis = agent.analyzeProject(this.sourceDir, this.targetDir);
    
    // Step 2: Execute conversion plan
    const results = agent.executeConversionPlan();
    
    // Step 3: Display results
    console.log('\\n✅ Conversion completed!');
    console.log(`  Successful operations: ${results.successful}`);
    console.log(`  Failed operations: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\\n❌ Failed operations:');
      results.details.filter(d => !d.success).forEach(detail => {
        console.log(`  - ${detail.step}: ${detail.error}`);
      });
    }
  }

  /**
   * Run the copy-java command
   */
  async runCopyJava() {
    console.log('📁 Copying Java files...');
    console.log(`Source: ${this.sourceDir}`);
    console.log(`Target: ${this.targetDir}`);

    // Check if source directory exists
    if (!FileSystemTools.exists(this.sourceDir)) {
      console.error(`❌ Source directory not found: ${this.sourceDir}`);
      return;
    }

    // Initialize Java file copier
    const copier = new JavaFileCopier(
      `${this.sourceDir}/src/main/java`,
      `${this.targetDir}/src/main/java`
    );

    // Get statistics
    const stats = copier.getJavaFileStats();
    console.log(`📊 Found ${stats.totalFiles} Java files`);

    // Copy files
    const copiedFiles = copier.copyJavaFiles();
    console.log(`✅ Copied ${copiedFiles.length} Java files`);

    // Display copied files
    if (copiedFiles.length > 0) {
      console.log('\\n📁 Copied files:');
      copiedFiles.forEach(file => {
        console.log(`  - ${file.relativePath}`);
      });
    }
  }

  /**
   * Run the CLI
   * @param {Array} args - Command line arguments
   */
  async run(args) {
    const parsed = this.parseArgs(args);

    // Override source and target directories if specified
    if (parsed.options.source) {
      this.sourceDir = path.resolve(parsed.options.source);
    }
    if (parsed.options.target) {
      this.targetDir = path.resolve(parsed.options.target);
    }

    // Execute command
    switch (parsed.command) {
      case 'analyze':
        await this.runAnalyze();
        break;
      case 'convert':
        await this.runConvert();
        break;
      case 'copy-java':
        await this.runCopyJava();
        break;
      case 'help':
      default:
        this.showHelp();
        break;
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new JSPConverterCLI();
  const args = process.argv.slice(2);
  cli.run(args).catch(console.error);
}

module.exports = JSPConverterCLI;