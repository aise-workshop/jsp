const path = require('path');
const FileSystemTools = require('./filesystem-tools');

/**
 * AI Agent that converts JSP projects to Spring Boot
 */
class AIAgent {
  constructor(options = {}) {
    this.tools = new FileSystemTools();
    this.verbose = options.verbose || false;
    this.conversionRules = this.loadConversionRules();
  }

  /**
   * Load conversion rules for JSP to Spring Boot
   */
  loadConversionRules() {
    return {
      // JSP files conversion
      jspToThymeleaf: {
        '.jsp': '.html',
        patterns: [
          {
            from: /<%@ taglib uri="http:\/\/java\.sun\.com\/jsp\/jstl\/core" prefix="c" %>/g,
            to: 'xmlns:th="http://www.thymeleaf.org"'
          },
          {
            from: /<c:out value="\${([^}]+)}"\s*\/>/g,
            to: '[[${$1}]]'
          },
          {
            from: /<c:forEach items="\${([^}]+)}" var="([^"]+)">/g,
            to: '<div th:each="$2 : ${$1}">'
          },
          {
            from: /<\/c:forEach>/g,
            to: '</div>'
          }
        ]
      },
      
      // Java servlet to Spring Boot controller
      servletToController: {
        patterns: [
          {
            from: /extends\s+HttpServlet/g,
            to: ''
          },
          {
            from: /@WebServlet/g,
            to: '@RestController'
          },
          {
            from: /import\s+javax\.servlet\.[^;]+;/g,
            to: 'import org.springframework.web.bind.annotation.*;'
          }
        ]
      }
    };
  }

  /**
   * Main conversion logic
   */
  async convert(sourcePath, targetPath) {
    this.log(`Starting conversion from ${sourcePath} to ${targetPath}`);
    
    try {
      // Step 1: Analyze source project structure
      const sourceStructure = await this.analyzeProject(sourcePath);
      this.log(`Analyzed source project: ${sourceStructure.files.length} files found`);
      
      // Step 2: Plan conversion strategy
      const conversionPlan = await this.createConversionPlan(sourceStructure);
      this.log(`Created conversion plan with ${conversionPlan.actions.length} actions`);
      
      // Step 3: Execute conversion
      await this.executeConversionPlan(conversionPlan, sourcePath, targetPath);
      this.log('Conversion completed successfully');
      
      return {
        success: true,
        message: 'JSP project converted to Spring Boot successfully'
      };
    } catch (error) {
      this.log(`Conversion failed: ${error.message}`, 'error');
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Analyze project structure using tools
   */
  async analyzeProject(projectPath) {
    const structure = {
      root: projectPath,
      files: [],
      directories: []
    };

    await this.scanDirectory(projectPath, structure);
    return structure;
  }

  /**
   * Recursively scan directory structure
   */
  async scanDirectory(dirPath, structure, relativePath = '') {
    const items = await this.tools.listDirectory(dirPath);
    
    for (const item of items) {
      const relativeItemPath = path.join(relativePath, item.name);
      
      if (item.type === 'directory') {
        structure.directories.push({
          name: item.name,
          path: item.path,
          relativePath: relativeItemPath
        });
        
        // Recursively scan subdirectories
        await this.scanDirectory(item.path, structure, relativeItemPath);
      } else {
        structure.files.push({
          name: item.name,
          path: item.path,
          relativePath: relativeItemPath,
          extension: path.extname(item.name),
          size: item.size
        });
      }
    }
  }

  /**
   * Create conversion plan based on project analysis
   */
  async createConversionPlan(sourceStructure) {
    const plan = {
      actions: []
    };

    for (const file of sourceStructure.files) {
      const action = this.decideActionForFile(file);
      if (action) {
        plan.actions.push(action);
      }
    }

    return plan;
  }

  /**
   * Decide what action to take for each file
   */
  decideActionForFile(file) {
    const ext = file.extension.toLowerCase();
    
    if (ext === '.jsp') {
      return {
        type: 'convert_jsp_to_thymeleaf',
        sourceFile: file,
        targetPath: this.getThymeleafPath(file.relativePath)
      };
    }
    
    if (ext === '.java' && file.relativePath.includes('servlet')) {
      return {
        type: 'convert_servlet_to_controller',
        sourceFile: file,
        targetPath: this.getControllerPath(file.relativePath)
      };
    }
    
    if (ext === '.java' && !file.relativePath.includes('servlet')) {
      return {
        type: 'copy_java_file',
        sourceFile: file,
        targetPath: this.getJavaPath(file.relativePath)
      };
    }
    
    if (ext === '.css' || ext === '.js' || ext === '.png' || ext === '.jpg' || ext === '.gif') {
      return {
        type: 'copy_static_resource',
        sourceFile: file,
        targetPath: this.getStaticResourcePath(file.relativePath)
      };
    }
    
    return null;
  }

  /**
   * Execute the conversion plan
   */
  async executeConversionPlan(plan, sourcePath, targetPath) {
    for (const action of plan.actions) {
      await this.executeAction(action, sourcePath, targetPath);
    }
  }

  /**
   * Execute individual action
   */
  async executeAction(action, sourcePath, targetPath) {
    const fullTargetPath = path.join(targetPath, action.targetPath);
    
    switch (action.type) {
      case 'convert_jsp_to_thymeleaf':
        await this.convertJspToThymeleaf(action.sourceFile.path, fullTargetPath);
        break;
      case 'convert_servlet_to_controller':
        await this.convertServletToController(action.sourceFile.path, fullTargetPath);
        break;
      case 'copy_java_file':
        await this.copyJavaFile(action.sourceFile.path, fullTargetPath);
        break;
      case 'copy_static_resource':
        await this.tools.copyFile(action.sourceFile.path, fullTargetPath);
        break;
    }
    
    this.log(`Executed: ${action.type} - ${action.sourceFile.name}`);
  }

  /**
   * Convert JSP to Thymeleaf
   */
  async convertJspToThymeleaf(sourcePath, targetPath) {
    let content = await this.tools.readFile(sourcePath);
    
    // Apply conversion patterns
    for (const pattern of this.conversionRules.jspToThymeleaf.patterns) {
      content = content.replace(pattern.from, pattern.to);
    }
    
    // Additional cleanup - remove JSP directives
    content = content.replace(/<%@ page[^%>]*%>\s*/g, '');
    content = content.replace(/<%@ taglib[^%>]*%>\s*/g, '');
    
    // Convert remaining JSP expressions to Thymeleaf (but not ones already converted)
    content = content.replace(/(?<!\[\[)\${([^}]+)}(?!\]\])/g, '[[$1]]');
    
    // Add proper HTML structure if missing
    if (!content.includes('<html')) {
      content = `<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Converted from JSP</title>
</head>
<body>
${content}
</body>
</html>`;
    } else {
      // Add thymeleaf namespace to existing html tag
      content = content.replace(/<html([^>]*)>/, '<html$1 xmlns:th="http://www.thymeleaf.org">');
    }
    
    await this.tools.writeFile(targetPath, content);
  }

  /**
   * Convert Servlet to Spring Boot Controller
   */
  async convertServletToController(sourcePath, targetPath) {
    let content = await this.tools.readFile(sourcePath);
    
    // Apply conversion patterns
    for (const pattern of this.conversionRules.servletToController.patterns) {
      content = content.replace(pattern.from, pattern.to);
    }
    
    await this.tools.writeFile(targetPath, content);
  }

  /**
   * Copy Java file with package adjustments
   */
  async copyJavaFile(sourcePath, targetPath) {
    let content = await this.tools.readFile(sourcePath);
    
    // Update package declarations if needed
    content = content.replace(/package\s+([^;]+);/, (match, packageName) => {
      const newPackage = packageName.replace(/^com\.shpota\.blog/, 'com.example.demo');
      return `package ${newPackage};`;
    });
    
    // Update imports
    content = content.replace(/import\s+com\.shpota\.blog\.([^;]+);/g, 'import com.example.demo.$1;');
    
    await this.tools.writeFile(targetPath, content);
  }

  /**
   * Helper methods for path transformations
   */
  getThymeleafPath(relativePath) {
    return relativePath
      .replace(/src\/main\/webapp/, 'src/main/resources/templates')
      .replace(/\.jsp$/, '.html');
  }

  getControllerPath(relativePath) {
    return relativePath
      .replace(/src\/main\/java/, 'src/main/java')
      .replace(/servlet/g, 'controller');
  }

  getJavaPath(relativePath) {
    return relativePath.replace(/src\/main\/java/, 'src/main/java');
  }

  getStaticResourcePath(relativePath) {
    return relativePath
      .replace(/src\/main\/webapp/, 'src/main/resources/static');
  }

  /**
   * Logging utility
   */
  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }
}

module.exports = AIAgent;