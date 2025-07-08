const FileSystemTools = require('./tools');

/**
 * AI Agent for managing JSP to Spring Boot conversion
 */
class AIAgent {
  constructor() {
    this.tools = {
      list_dir: FileSystemTools.list_dir,
      read_file: FileSystemTools.read_file,
      write_file: FileSystemTools.write_file,
      exists: FileSystemTools.exists,
      copy_file: FileSystemTools.copy_file
    };
    
    this.conversionPlan = [];
    this.executionLog = [];
  }

  /**
   * Analyze the source project and create a conversion plan
   * @param {string} sourceDir - Source project directory
   * @param {string} targetDir - Target project directory
   * @returns {Object} Analysis result with conversion plan
   */
  analyzeProject(sourceDir, targetDir) {
    console.log('🤖 AI Agent: Analyzing project for conversion...');
    
    const analysis = {
      sourceDir,
      targetDir,
      javaFiles: [],
      jspFiles: [],
      resourceFiles: [],
      conversionPlan: []
    };

    // Step 1: Analyze source structure
    const sourceJavaDir = `${sourceDir}/src/main/java`;
    const sourceWebappDir = `${sourceDir}/src/main/webapp`;
    const sourceResourcesDir = `${sourceDir}/src/main/resources`;

    // Find Java files
    if (this.tools.exists(sourceJavaDir)) {
      analysis.javaFiles = this.findFilesByExtension(sourceJavaDir, '.java');
      console.log(`📁 Found ${analysis.javaFiles.length} Java files`);
    }

    // Find JSP files
    if (this.tools.exists(sourceWebappDir)) {
      analysis.jspFiles = this.findFilesByExtension(sourceWebappDir, '.jsp');
      console.log(`📄 Found ${analysis.jspFiles.length} JSP files`);
    }

    // Find resource files
    if (this.tools.exists(sourceResourcesDir)) {
      analysis.resourceFiles = this.findAllFiles(sourceResourcesDir);
      console.log(`📦 Found ${analysis.resourceFiles.length} resource files`);
    }

    // Step 2: Create conversion plan
    analysis.conversionPlan = this.createConversionPlan(analysis);
    
    this.conversionPlan = analysis.conversionPlan;
    console.log(`📋 Created conversion plan with ${this.conversionPlan.length} steps`);
    
    return analysis;
  }

  /**
   * Execute the conversion plan
   * @returns {Object} Execution result
   */
  executeConversionPlan() {
    console.log('🚀 AI Agent: Executing conversion plan...');
    
    const results = {
      successful: 0,
      failed: 0,
      details: []
    };

    for (const step of this.conversionPlan) {
      try {
        console.log(`⚙️ Executing: ${step.description}`);
        
        const result = this.executeStep(step);
        
        if (result.success) {
          results.successful++;
          console.log(`✅ Success: ${step.description}`);
        } else {
          results.failed++;
          console.log(`❌ Failed: ${step.description} - ${result.error}`);
        }
        
        results.details.push({
          step: step.description,
          success: result.success,
          error: result.error
        });
        
        this.executionLog.push({
          timestamp: new Date().toISOString(),
          step,
          result
        });
        
      } catch (error) {
        results.failed++;
        console.log(`❌ Error: ${step.description} - ${error.message}`);
        results.details.push({
          step: step.description,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`📊 Conversion completed: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  /**
   * Execute a single conversion step
   * @param {Object} step - Conversion step
   * @returns {Object} Execution result
   */
  executeStep(step) {
    switch (step.type) {
      case 'copy_java_file':
        return this.copyJavaFile(step.source, step.target);
      case 'copy_resource_file':
        return this.copyResourceFile(step.source, step.target);
      case 'convert_jsp_to_template':
        return this.convertJspToTemplate(step.source, step.target);
      case 'create_spring_controller':
        return this.createSpringController(step.target, step.config);
      default:
        return { success: false, error: `Unknown step type: ${step.type}` };
    }
  }

  /**
   * Copy a Java file
   * @param {string} source - Source file path
   * @param {string} target - Target file path
   * @returns {Object} Result
   */
  copyJavaFile(source, target) {
    if (this.tools.copy_file(source, target)) {
      return { success: true };
    }
    return { success: false, error: 'Failed to copy Java file' };
  }

  /**
   * Copy a resource file
   * @param {string} source - Source file path
   * @param {string} target - Target file path
   * @returns {Object} Result
   */
  copyResourceFile(source, target) {
    if (this.tools.copy_file(source, target)) {
      return { success: true };
    }
    return { success: false, error: 'Failed to copy resource file' };
  }

  /**
   * Convert JSP to Thymeleaf template (placeholder implementation)
   * @param {string} source - JSP file path
   * @param {string} target - Template file path
   * @returns {Object} Result
   */
  convertJspToTemplate(source, target) {
    const jspContent = this.tools.read_file(source);
    if (!jspContent) {
      return { success: false, error: 'Failed to read JSP file' };
    }

    // Basic JSP to Thymeleaf conversion (simplified)
    let templateContent = jspContent
      .replace(/<%@\s*page\s+.*?%>/g, '') // Remove JSP page directives
      .replace(/<%@\s*taglib\s+.*?%>/g, '') // Remove taglib directives
      .replace(/<%=\s*(.*?)\s*%>/g, '<span th:text="${$1}"></span>') // Expression conversion
      .replace(/<%\s*(.*?)\s*%>/g, '<!-- Java code: $1 -->'); // Comment out Java code

    // Add Thymeleaf namespace
    templateContent = templateContent.replace(
      /<html>/,
      '<html xmlns:th="http://www.thymeleaf.org">'
    );

    if (this.tools.write_file(target, templateContent)) {
      return { success: true };
    }
    return { success: false, error: 'Failed to write template file' };
  }

  /**
   * Create a Spring Boot controller (placeholder implementation)
   * @param {string} target - Controller file path
   * @param {Object} config - Configuration for controller
   * @returns {Object} Result
   */
  createSpringController(target, config) {
    const controllerContent = `package ${config.packageName};

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("${config.basePath}")
public class ${config.className} {

    @GetMapping
    public String index() {
        return "${config.viewName}";
    }
}
`;

    if (this.tools.write_file(target, controllerContent)) {
      return { success: true };
    }
    return { success: false, error: 'Failed to create controller' };
  }

  /**
   * Create conversion plan based on analysis
   * @param {Object} analysis - Project analysis
   * @returns {Array} Conversion plan steps
   */
  createConversionPlan(analysis) {
    const plan = [];

    // Step 1: Copy Java model files
    for (const javaFile of analysis.javaFiles) {
      const relativePath = javaFile.replace(analysis.sourceDir, '');
      const targetPath = analysis.targetDir + relativePath;
      
      plan.push({
        type: 'copy_java_file',
        description: `Copy Java file: ${relativePath}`,
        source: javaFile,
        target: targetPath
      });
    }

    // Step 2: Convert JSP files to Thymeleaf templates
    for (const jspFile of analysis.jspFiles) {
      const relativePath = jspFile.replace(analysis.sourceDir, '');
      const templatePath = relativePath
        .replace('/src/main/webapp/', '/src/main/resources/templates/')
        .replace('.jsp', '.html');
      const targetPath = analysis.targetDir + templatePath;
      
      plan.push({
        type: 'convert_jsp_to_template',
        description: `Convert JSP to template: ${relativePath}`,
        source: jspFile,
        target: targetPath
      });
    }

    // Step 3: Copy resource files
    for (const resourceFile of analysis.resourceFiles) {
      const relativePath = resourceFile.replace(analysis.sourceDir, '');
      const targetPath = analysis.targetDir + relativePath;
      
      plan.push({
        type: 'copy_resource_file',
        description: `Copy resource file: ${relativePath}`,
        source: resourceFile,
        target: targetPath
      });
    }

    return plan;
  }

  /**
   * Find files by extension in a directory
   * @param {string} dirPath - Directory path
   * @param {string} extension - File extension
   * @returns {Array} Array of file paths
   */
  findFilesByExtension(dirPath, extension) {
    const files = [];
    const items = this.tools.list_dir(dirPath);
    
    for (const item of items) {
      if (item.isDirectory) {
        files.push(...this.findFilesByExtension(item.path, extension));
      } else if (item.isFile && item.name.endsWith(extension)) {
        files.push(item.path);
      }
    }
    
    return files;
  }

  /**
   * Find all files in a directory
   * @param {string} dirPath - Directory path
   * @returns {Array} Array of file paths
   */
  findAllFiles(dirPath) {
    const files = [];
    const items = this.tools.list_dir(dirPath);
    
    for (const item of items) {
      if (item.isDirectory) {
        files.push(...this.findAllFiles(item.path));
      } else if (item.isFile) {
        files.push(item.path);
      }
    }
    
    return files;
  }
}

module.exports = AIAgent;