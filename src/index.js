/**
 * Main entry point for the JSP to Spring Boot conversion tool
 */

const JSPToSpringBootAgent = require('./agents/JSPToSpringBootAgent');
const BusinessLogicAnalyzer = require('./analyzers/BusinessLogicAnalyzer');
const FileCopier = require('./utils/FileCopier');
const logger = require('./utils/logger');

class JSPToSpringBootConverter {
  constructor() {
    this.agent = new JSPToSpringBootAgent();
    this.analyzer = new BusinessLogicAnalyzer();
    this.fileCopier = new FileCopier();
  }

  async convertProject(sourcePath, targetPath, options = {}) {
    const {
      analyzeLogic = true,
      captureScreenshots = false,
      baseUrl = 'http://localhost:8080',
      copyJavaFiles = false,
      cleanupCopiedFiles = true
    } = options;

    try {
      logger.info('Starting comprehensive JSP to Spring Boot conversion');

      const results = {
        analysis: null,
        logicAnalysis: null,
        screenshots: null,
        conversion: null,
        fileCopy: null
      };

      // Step 1: Analyze the project structure and patterns
      logger.info('Step 1: Analyzing project structure');
      results.analysis = await this.agent.analyzeProject(sourcePath);
      
      if (!results.analysis.success) {
        throw new Error(`Project analysis failed: ${results.analysis.error}`);
      }

      // Step 2: Analyze business logic patterns
      if (analyzeLogic) {
        logger.info('Step 2: Analyzing business logic patterns');
        results.logicAnalysis = await this.analyzer.analyzeLogicPatterns(sourcePath);
      }

      // Step 3: Capture screenshots for comparison
      if (captureScreenshots) {
        logger.info('Step 3: Capturing application screenshots');
        results.screenshots = await this.analyzer.captureApplicationScreenshots(baseUrl);
      }

      // Step 4: Copy Java files if requested
      if (copyJavaFiles) {
        logger.info('Step 4: Copying Java files');
        results.fileCopy = await this.fileCopier.copyJavaFiles(sourcePath, targetPath, {
          includeTests: true,
          preserveStructure: true
        });
      }

      // Step 5: Perform the actual conversion
      logger.info('Step 5: Performing conversion');
      results.conversion = await this.agent.convertProject(sourcePath, targetPath);

      // Step 6: Cleanup copied files if requested
      if (copyJavaFiles && cleanupCopiedFiles) {
        logger.info('Step 6: Cleaning up copied files');
        await this.fileCopier.cleanup();
      }

      logger.info('Conversion process completed successfully');
      return {
        success: true,
        results
      };

    } catch (error) {
      logger.error(`Conversion process failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeOnly(projectPath, options = {}) {
    const {
      includeLogicAnalysis = true,
      captureScreenshots = false,
      baseUrl = 'http://localhost:8080'
    } = options;

    try {
      const results = {};

      // Basic project analysis
      results.projectAnalysis = await this.agent.analyzeProject(projectPath);
      
      if (!results.projectAnalysis.success) {
        throw new Error(`Project analysis failed: ${results.projectAnalysis.error}`);
      }

      // Business logic analysis
      if (includeLogicAnalysis) {
        results.logicAnalysis = await this.analyzer.analyzeLogicPatterns(projectPath);
      }

      // Screenshots
      if (captureScreenshots) {
        results.screenshots = await this.analyzer.captureApplicationScreenshots(baseUrl);
      }

      return {
        success: true,
        results
      };

    } catch (error) {
      logger.error(`Analysis failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getAgent() {
    return this.agent;
  }

  getAnalyzer() {
    return this.analyzer;
  }

  getFileCopier() {
    return this.fileCopier;
  }
}

module.exports = JSPToSpringBootConverter;