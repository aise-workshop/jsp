#!/usr/bin/env node

/**
 * CLI interface for JSP to Spring Boot conversion tool
 */

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const JSPToSpringBootAgent = require('./agents/JSPToSpringBootAgent');
const FileCopier = require('./utils/FileCopier');
const logger = require('./utils/logger');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('jsp2spring')
  .description('AI-powered CLI tool for converting Java + JSP projects to Java + Spring Boot')
  .version(packageJson.version);

program
  .command('analyze <project-path>')
  .description('Analyze a JSP project and generate conversion recommendations')
  .option('-o, --output <file>', 'Output analysis to file')
  .option('-v, --verbose', 'Verbose output')
  .action(async (projectPath, options) => {
    try {
      console.log(chalk.blue(`🔍 Analyzing JSP project: ${projectPath}`));
      
      const agent = new JSPToSpringBootAgent();
      const analysis = await agent.analyzeProject(path.resolve(projectPath));
      
      if (!analysis.success) {
        console.error(chalk.red(`❌ Analysis failed: ${analysis.error}`));
        process.exit(1);
      }

      console.log(chalk.green('✅ Analysis completed successfully!'));
      
      // Display summary
      displayAnalysisSummary(analysis);
      
      // Save to file if requested
      if (options.output) {
        const outputPath = path.resolve(options.output);
        await fs.writeJSON(outputPath, analysis, { spaces: 2 });
        console.log(chalk.blue(`📄 Analysis saved to: ${outputPath}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('convert <source-path> <target-path>')
  .description('Convert JSP project to Spring Boot')
  .option('-a, --analyze-only', 'Only analyze, do not convert')
  .option('-c, --copy-java', 'Copy Java files (will be cleaned up)')
  .option('-v, --verbose', 'Verbose output')
  .action(async (sourcePath, targetPath, options) => {
    try {
      const resolvedSource = path.resolve(sourcePath);
      const resolvedTarget = path.resolve(targetPath);
      
      console.log(chalk.blue(`🚀 Converting JSP project`));
      console.log(chalk.gray(`Source: ${resolvedSource}`));
      console.log(chalk.gray(`Target: ${resolvedTarget}`));
      
      const agent = new JSPToSpringBootAgent();
      
      if (options.analyzeOnly) {
        console.log(chalk.blue('🔍 Analysis mode only'));
        const analysis = await agent.analyzeProject(resolvedSource);
        
        if (!analysis.success) {
          console.error(chalk.red(`❌ Analysis failed: ${analysis.error}`));
          process.exit(1);
        }
        
        displayAnalysisSummary(analysis);
        return;
      }

      // Copy Java files if requested
      let copier = null;
      if (options.copyJava) {
        console.log(chalk.blue('📂 Copying Java files...'));
        copier = new FileCopier();
        const copyResult = await copier.copyJavaFiles(resolvedSource, resolvedTarget);
        
        if (copyResult.success) {
          console.log(chalk.green(`✅ Copied ${copyResult.copied} Java files`));
        } else {
          console.error(chalk.red(`❌ Copy failed: ${copyResult.error}`));
        }
      }

      // Perform conversion
      console.log(chalk.blue('⚙️  Converting project...'));
      const result = await agent.convertProject(resolvedSource, resolvedTarget);
      
      if (!result.success) {
        console.error(chalk.red(`❌ Conversion failed: ${result.error}`));
        process.exit(1);
      }

      console.log(chalk.green('✅ Conversion completed successfully!'));
      displayConversionResults(result);

      // Cleanup copied files as per requirements
      if (copier) {
        console.log(chalk.yellow('🧹 Cleaning up copied files (as per requirements)...'));
        const cleanupResults = await copier.cleanup();
        const cleanedCount = cleanupResults.filter(r => r.success).length;
        console.log(chalk.green(`✅ Cleaned up ${cleanedCount} files`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('tools')
  .description('List available tools')
  .action(() => {
    console.log(chalk.blue('🛠️  Available Tools:'));
    
    const agent = new JSPToSpringBootAgent();
    const tools = agent.getAvailableTools();
    
    tools.forEach(tool => {
      console.log(chalk.green(`  • ${tool}`));
    });
  });

program
  .command('use-tool <tool-name>')
  .description('Use a specific tool directly')
  .option('-p, --params <json>', 'Tool parameters as JSON string')
  .action(async (toolName, options) => {
    try {
      const agent = new JSPToSpringBootAgent();
      const params = options.params ? JSON.parse(options.params) : {};
      
      console.log(chalk.blue(`🔧 Using tool: ${toolName}`));
      
      const result = await agent.useTool(toolName, params);
      
      if (result.success) {
        console.log(chalk.green('✅ Tool executed successfully'));
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.error(chalk.red(`❌ Tool failed: ${result.error}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

function displayAnalysisSummary(analysis) {
  console.log(chalk.yellow('\n📊 Analysis Summary:'));
  console.log(chalk.gray(`JSP Files: ${analysis.jspAnalysis.files.length}`));
  console.log(chalk.gray(`Java Files: ${analysis.structure.javaFiles.length}`));
  console.log(chalk.gray(`Controllers: ${analysis.servletAnalysis.controllers.length}`));
  console.log(chalk.gray(`Strategies: ${analysis.servletAnalysis.strategies.length}`));
  console.log(chalk.gray(`Repositories: ${analysis.servletAnalysis.repositories.length}`));
  
  if (analysis.conversionPlan) {
    console.log(chalk.yellow('\n📋 Conversion Plan:'));
    analysis.conversionPlan.tasks.forEach((task, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${task.type} (${task.priority} priority)`));
    });
  }
}

function displayConversionResults(result) {
  console.log(chalk.yellow('\n📈 Conversion Results:'));
  
  const successful = result.results.filter(r => r.success).length;
  const failed = result.results.filter(r => !r.success).length;
  
  console.log(chalk.green(`✅ Successful tasks: ${successful}`));
  if (failed > 0) {
    console.log(chalk.red(`❌ Failed tasks: ${failed}`));
  }
  
  result.results.forEach((taskResult, index) => {
    const status = taskResult.success ? chalk.green('✅') : chalk.red('❌');
    console.log(`  ${status} ${taskResult.task.type}`);
    
    if (!taskResult.success) {
      console.log(chalk.red(`    Error: ${taskResult.error}`));
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Ensure logs directory exists
fs.ensureDirSync(path.join(process.cwd(), 'logs'));

if (require.main === module) {
  program.parse();
}

module.exports = program;