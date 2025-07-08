/**
 * Business Logic Analyzer with Puppeteer integration
 * Analyzes existing logic and captures screenshots for comparison
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class BusinessLogicAnalyzer {
  constructor() {
    this.screenshotPath = path.join(process.cwd(), 'screenshots');
    this.analysisResults = [];
  }

  async analyzeLogicPatterns(projectPath) {
    logger.info(`Analyzing business logic patterns in: ${projectPath}`);
    
    try {
      // Analyze servlet patterns
      const servletPatterns = await this._analyzeServletPatterns(projectPath);
      
      // Analyze JSP patterns
      const jspPatterns = await this._analyzeJSPPatterns(projectPath);
      
      // Analyze data flow
      const dataFlow = await this._analyzeDataFlow(projectPath);
      
      // Analyze security patterns
      const securityPatterns = await this._analyzeSecurityPatterns(projectPath);
      
      const analysis = {
        timestamp: new Date().toISOString(),
        projectPath,
        servletPatterns,
        jspPatterns,
        dataFlow,
        securityPatterns,
        recommendations: this._generateRecommendations({
          servletPatterns,
          jspPatterns,
          dataFlow,
          securityPatterns
        })
      };

      this.analysisResults.push(analysis);
      return analysis;
      
    } catch (error) {
      logger.error(`Error analyzing business logic: ${error.message}`);
      throw error;
    }
  }

  async captureApplicationScreenshots(baseUrl, endpoints = []) {
    logger.info(`Capturing screenshots for comparison: ${baseUrl}`);
    
    const screenshots = [];
    
    try {
      // This is a placeholder for Puppeteer integration
      // We'll implement this with a mock for now due to installation issues
      const mockScreenshots = await this._mockCaptureScreenshots(baseUrl, endpoints);
      screenshots.push(...mockScreenshots);
      
      return {
        success: true,
        screenshots,
        baseUrl,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error(`Error capturing screenshots: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async _mockCaptureScreenshots(baseUrl, endpoints) {
    // Mock implementation for now
    await fs.ensureDir(this.screenshotPath);
    
    const mockScreenshots = [];
    const defaultEndpoints = endpoints.length > 0 ? endpoints : [
      '/',
      '/posts',
      '/posts/create',
      '/posts/1',
      '/posts/1/edit'
    ];

    for (const endpoint of defaultEndpoints) {
      const filename = `${endpoint.replace(/\//g, '_') || 'home'}_${Date.now()}.png`;
      const filepath = path.join(this.screenshotPath, filename);
      
      // Create a mock screenshot file
      await fs.writeFile(filepath, Buffer.from('mock-screenshot-data'));
      
      mockScreenshots.push({
        endpoint,
        filename,
        filepath,
        url: `${baseUrl}${endpoint}`,
        timestamp: new Date().toISOString(),
        mock: true
      });
    }

    return mockScreenshots;
  }

  async _realCaptureScreenshots(baseUrl, endpoints) {
    // Real Puppeteer implementation (commented out due to installation issues)
    /*
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await fs.ensureDir(this.screenshotPath);
    
    const screenshots = [];
    const defaultEndpoints = endpoints.length > 0 ? endpoints : [
      '/',
      '/posts',
      '/posts/create',
      '/posts/1',
      '/posts/1/edit'
    ];

    for (const endpoint of defaultEndpoints) {
      try {
        const url = `${baseUrl}${endpoint}`;
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const filename = `${endpoint.replace(/\//g, '_') || 'home'}_${Date.now()}.png`;
        const filepath = path.join(this.screenshotPath, filename);
        
        await page.screenshot({ 
          path: filepath,
          fullPage: true 
        });
        
        screenshots.push({
          endpoint,
          filename,
          filepath,
          url,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`Screenshot captured: ${filepath}`);
        
      } catch (error) {
        logger.error(`Error capturing screenshot for ${endpoint}: ${error.message}`);
      }
    }

    await browser.close();
    return screenshots;
    */
    
    // For now, return mock data
    return await this._mockCaptureScreenshots(baseUrl, endpoints);
  }

  async _analyzeServletPatterns(projectPath) {
    const patterns = {
      strategyPattern: false,
      facadePattern: false,
      observerPattern: false,
      singletonPattern: false,
      daoPattern: false,
      mvcPattern: false,
      frontControllerPattern: false
    };

    try {
      // Look for strategy pattern (like in the blog example)
      const strategyFiles = await this._findFiles(projectPath, '*Strategy.java');
      patterns.strategyPattern = strategyFiles.length > 0;

      // Look for DAO pattern
      const daoFiles = await this._findFiles(projectPath, '*Repository.java');
      patterns.daoPattern = daoFiles.length > 0;

      // Look for MVC pattern
      const controllerFiles = await this._findFiles(projectPath, '*Controller.java');
      patterns.mvcPattern = controllerFiles.length > 0;

      // Analyze servlet content for other patterns
      const servletFiles = await this._findFiles(projectPath, '*.java');
      for (const file of servletFiles) {
        const content = await fs.readFile(file, 'utf8');
        
        if (content.includes('getInstance(') && content.includes('private static')) {
          patterns.singletonPattern = true;
        }
        
        if (content.includes('RequestDispatcher') || content.includes('sendRedirect')) {
          patterns.frontControllerPattern = true;
        }
      }

      return patterns;
      
    } catch (error) {
      logger.error(`Error analyzing servlet patterns: ${error.message}`);
      return patterns;
    }
  }

  async _analyzeJSPPatterns(projectPath) {
    const patterns = {
      jstlUsage: false,
      elExpressions: false,
      customTags: false,
      includes: false,
      forwards: false,
      sessionManagement: false,
      errorHandling: false
    };

    try {
      const jspFiles = await this._findFiles(projectPath, '*.jsp');
      
      for (const file of jspFiles) {
        const content = await fs.readFile(file, 'utf8');
        
        if (content.includes('<c:') || content.includes('<fmt:')) {
          patterns.jstlUsage = true;
        }
        
        if (content.includes('${')) {
          patterns.elExpressions = true;
        }
        
        if (content.includes('<%@') && content.includes('taglib')) {
          patterns.customTags = true;
        }
        
        if (content.includes('<%@') && content.includes('include')) {
          patterns.includes = true;
        }
        
        if (content.includes('<jsp:forward')) {
          patterns.forwards = true;
        }
        
        if (content.includes('session.')) {
          patterns.sessionManagement = true;
        }
        
        if (content.includes('error') || content.includes('exception')) {
          patterns.errorHandling = true;
        }
      }

      return patterns;
      
    } catch (error) {
      logger.error(`Error analyzing JSP patterns: ${error.message}`);
      return patterns;
    }
  }

  async _analyzeDataFlow(projectPath) {
    const dataFlow = {
      requestFlow: [],
      responseFlow: [],
      dataBinding: [],
      validationPoints: [],
      transactionBoundaries: []
    };

    try {
      const javaFiles = await this._findFiles(projectPath, '*.java');
      
      for (const file of javaFiles) {
        const content = await fs.readFile(file, 'utf8');
        const filename = path.basename(file);
        
        // Analyze request flow
        if (content.includes('doGet') || content.includes('doPost')) {
          dataFlow.requestFlow.push({
            file: filename,
            methods: this._extractMethods(content, ['doGet', 'doPost'])
          });
        }
        
        // Analyze response flow
        if (content.includes('sendRedirect') || content.includes('RequestDispatcher')) {
          dataFlow.responseFlow.push({
            file: filename,
            redirects: this._extractRedirects(content)
          });
        }
        
        // Analyze validation
        if (content.includes('validate') || content.includes('isValid')) {
          dataFlow.validationPoints.push({
            file: filename,
            validations: this._extractValidations(content)
          });
        }
        
        // Analyze transactions
        if (content.includes('@Transactional') || content.includes('beginTransaction')) {
          dataFlow.transactionBoundaries.push({
            file: filename,
            transactions: this._extractTransactions(content)
          });
        }
      }

      return dataFlow;
      
    } catch (error) {
      logger.error(`Error analyzing data flow: ${error.message}`);
      return dataFlow;
    }
  }

  async _analyzeSecurityPatterns(projectPath) {
    const security = {
      authenticationMechanisms: [],
      authorizationChecks: [],
      inputValidation: [],
      sqlInjectionProtection: false,
      xssProtection: false,
      csrfProtection: false,
      sessionSecurity: []
    };

    try {
      const javaFiles = await this._findFiles(projectPath, '*.java');
      
      for (const file of javaFiles) {
        const content = await fs.readFile(file, 'utf8');
        const filename = path.basename(file);
        
        // Look for authentication
        if (content.includes('login') || content.includes('authenticate')) {
          security.authenticationMechanisms.push({
            file: filename,
            type: 'custom',
            details: this._extractAuthPatterns(content)
          });
        }
        
        // Look for authorization
        if (content.includes('role') || content.includes('permission')) {
          security.authorizationChecks.push({
            file: filename,
            checks: this._extractAuthorizationChecks(content)
          });
        }
        
        // Look for input validation
        if (content.includes('validate') || content.includes('sanitize')) {
          security.inputValidation.push({
            file: filename,
            validations: this._extractInputValidations(content)
          });
        }
        
        // Look for SQL injection protection
        if (content.includes('PreparedStatement') || content.includes('parameterized')) {
          security.sqlInjectionProtection = true;
        }
        
        // Look for session security
        if (content.includes('session.invalidate') || content.includes('session.setMaxInactiveInterval')) {
          security.sessionSecurity.push({
            file: filename,
            measures: this._extractSessionSecurity(content)
          });
        }
      }

      return security;
      
    } catch (error) {
      logger.error(`Error analyzing security patterns: ${error.message}`);
      return security;
    }
  }

  _generateRecommendations(analysis) {
    const recommendations = [];
    
    // Strategy pattern recommendations
    if (analysis.servletPatterns.strategyPattern) {
      recommendations.push({
        category: 'architecture',
        priority: 'high',
        title: 'Convert Strategy Pattern to Spring Components',
        description: 'Convert existing strategy pattern to Spring @Service or @Component beans'
      });
    }
    
    // JSTL to Thymeleaf recommendations
    if (analysis.jspPatterns.jstlUsage) {
      recommendations.push({
        category: 'templating',
        priority: 'high',
        title: 'Migrate JSTL to Thymeleaf',
        description: 'Replace JSTL tags with Thymeleaf equivalents for better Spring Boot integration'
      });
    }
    
    // Security recommendations
    if (!analysis.securityPatterns.csrfProtection) {
      recommendations.push({
        category: 'security',
        priority: 'medium',
        title: 'Add CSRF Protection',
        description: 'Implement Spring Security CSRF protection for form submissions'
      });
    }
    
    return recommendations;
  }

  async _findFiles(dir, pattern) {
    const files = [];
    
    const processDir = async (currentDir) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await processDir(fullPath);
        } else if (entry.isFile()) {
          const matches = pattern.replace('*', '.*').replace('.', '\\.');
          if (new RegExp(matches).test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    };

    await processDir(dir);
    return files;
  }

  _extractMethods(content, methodNames) {
    const methods = [];
    for (const methodName of methodNames) {
      const regex = new RegExp(`(public|protected|private)?\\s+\\w+\\s+${methodName}\\s*\\([^)]*\\)`, 'g');
      const matches = content.match(regex);
      if (matches) {
        methods.push(...matches);
      }
    }
    return methods;
  }

  _extractRedirects(content) {
    const redirects = [];
    const sendRedirectMatches = content.match(/sendRedirect\s*\(\s*"([^"]+)"/g);
    const forwardMatches = content.match(/forward\s*\(\s*"([^"]+)"/g);
    
    if (sendRedirectMatches) redirects.push(...sendRedirectMatches);
    if (forwardMatches) redirects.push(...forwardMatches);
    
    return redirects;
  }

  _extractValidations(content) {
    const validations = [];
    const validateMatches = content.match(/validate\w*\s*\([^)]*\)/g);
    if (validateMatches) validations.push(...validateMatches);
    return validations;
  }

  _extractTransactions(content) {
    const transactions = [];
    const transactionMatches = content.match(/@Transactional[^}]*}|beginTransaction[^}]*}/g);
    if (transactionMatches) transactions.push(...transactionMatches);
    return transactions;
  }

  _extractAuthPatterns(content) {
    const patterns = [];
    const authMatches = content.match(/(login|authenticate)\w*\s*\([^)]*\)/g);
    if (authMatches) patterns.push(...authMatches);
    return patterns;
  }

  _extractAuthorizationChecks(content) {
    const checks = [];
    const roleMatches = content.match(/(role|permission)\w*\s*\([^)]*\)/g);
    if (roleMatches) checks.push(...roleMatches);
    return checks;
  }

  _extractInputValidations(content) {
    const validations = [];
    const inputMatches = content.match(/(validate|sanitize)\w*\s*\([^)]*\)/g);
    if (inputMatches) validations.push(...inputMatches);
    return validations;
  }

  _extractSessionSecurity(content) {
    const measures = [];
    const sessionMatches = content.match(/session\.\w+\([^)]*\)/g);
    if (sessionMatches) measures.push(...sessionMatches);
    return measures;
  }

  getAnalysisResults() {
    return [...this.analysisResults];
  }

  async saveAnalysisReport(outputPath) {
    const report = {
      generatedAt: new Date().toISOString(),
      analyses: this.analysisResults,
      summary: this._generateSummary()
    };

    await fs.writeJSON(outputPath, report, { spaces: 2 });
    logger.info(`Analysis report saved to: ${outputPath}`);
  }

  _generateSummary() {
    if (this.analysisResults.length === 0) {
      return { message: 'No analyses performed yet' };
    }

    const latest = this.analysisResults[this.analysisResults.length - 1];
    return {
      totalProjects: this.analysisResults.length,
      latestAnalysis: {
        projectPath: latest.projectPath,
        timestamp: latest.timestamp,
        recommendationCount: latest.recommendations.length
      }
    };
  }
}

module.exports = BusinessLogicAnalyzer;