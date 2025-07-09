/**
 * AI Agent for JSP to Spring Boot conversion
 * Orchestrates tools and makes decisions about file transformations
 */

const { ListDirTool, ReadFileTool, WriteFileTool } = require('../tools');
const JSPToThymeleafTransformer = require('../transformers/JSPToThymeleafTransformer');
const SpringBootConfigGenerator = require('../transformers/SpringBootConfigGenerator');
const logger = require('../utils/logger');
const path = require('path');

class JSPToSpringBootAgent {
  constructor() {
    this.tools = new Map();
    this.jspTransformer = new JSPToThymeleafTransformer();
    this.configGenerator = new SpringBootConfigGenerator();
    this._initializeTools();
  }

  _initializeTools() {
    const tools = [
      new ListDirTool(),
      new ReadFileTool(),
      new WriteFileTool()
    ];

    tools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    logger.info(`Initialized ${tools.length} tools`);
  }

  async analyzeProject(projectPath) {
    logger.info(`Starting project analysis: ${projectPath}`);

    try {
      // Step 1: Analyze project structure
      const structure = await this._analyzeProjectStructure(projectPath);

      // Step 2: Identify JSP files and patterns
      const jspAnalysis = await this._analyzeJSPFiles(structure);

      // Step 3: Analyze Java servlets and controllers
      const servletAnalysis = await this._analyzeServlets(structure);

      // Step 4: Generate conversion plan
      const conversionPlan = await this._generateConversionPlan(jspAnalysis, servletAnalysis);

      return {
        success: true,
        structure,
        jspAnalysis,
        servletAnalysis,
        conversionPlan
      };
    } catch (error) {
      logger.error(`Error analyzing project: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async convertProject(sourcePath, targetPath, options = {}) {
    logger.info(`Starting conversion from ${sourcePath} to ${targetPath}`);

    try {
      // First analyze the project
      const analysis = await this.analyzeProject(sourcePath);
      if (!analysis.success) {
        throw new Error(`Analysis failed: ${analysis.error}`);
      }

      // Execute conversion plan
      const results = await this._executeConversionPlan(
        analysis.conversionPlan,
        sourcePath,
        targetPath,
        options,
        analysis
      );

      return {
        success: true,
        analysis,
        results
      };
    } catch (error) {
      logger.error(`Error converting project: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async _analyzeProjectStructure(projectPath) {
    const listTool = this.tools.get('list_dir');

    // Get project structure recursively
    const result = await listTool.execute({
      dirPath: projectPath,
      recursive: true,
      filter: (name) => !name.startsWith('.') && name !== 'target' && name !== 'node_modules'
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // Categorize files
    const structure = {
      jspFiles: [],
      javaFiles: [],
      configFiles: [],
      staticFiles: [],
      other: []
    };

    result.items.forEach(item => {
      if (item.type === 'file') {
        const ext = path.extname(item.name).toLowerCase();
        if (ext === '.jsp') {
          structure.jspFiles.push(item);
        } else if (ext === '.java') {
          structure.javaFiles.push(item);
        } else if (['.xml', '.properties', '.yml', '.yaml'].includes(ext)) {
          structure.configFiles.push(item);
        } else if (['.html', '.css', '.js', '.png', '.jpg', '.gif'].includes(ext)) {
          structure.staticFiles.push(item);
        } else {
          structure.other.push(item);
        }
      }
    });

    return structure;
  }

  async _analyzeJSPFiles(structure) {
    const readTool = this.tools.get('read_file');
    const jspAnalysis = {
      files: [],
      patterns: new Set(),
      dependencies: new Set()
    };

    for (const jspFile of structure.jspFiles) {
      const content = await readTool.execute({ filePath: jspFile.path });
      if (content.success) {
        const analysis = this._analyzeJSPContent(content.content);
        jspAnalysis.files.push({
          ...jspFile,
          analysis
        });

        // Collect patterns and dependencies
        analysis.patterns.forEach(p => jspAnalysis.patterns.add(p));
        analysis.dependencies.forEach(d => jspAnalysis.dependencies.add(d));
      }
    }

    return jspAnalysis;
  }

  async _analyzeServlets(structure) {
    const readTool = this.tools.get('read_file');
    const servletAnalysis = {
      controllers: [],
      strategies: [],
      repositories: [],
      patterns: new Set()
    };

    for (const javaFile of structure.javaFiles) {
      const content = await readTool.execute({ filePath: javaFile.path });
      if (content.success) {
        const analysis = this._analyzeJavaContent(content.content, javaFile.path);

        if (analysis.isController) {
          servletAnalysis.controllers.push({ ...javaFile, analysis });
        } else if (analysis.isStrategy) {
          servletAnalysis.strategies.push({ ...javaFile, analysis });
        } else if (analysis.isRepository) {
          servletAnalysis.repositories.push({ ...javaFile, analysis });
        }

        analysis.patterns.forEach(p => servletAnalysis.patterns.add(p));
      }
    }

    return servletAnalysis;
  }

  _analyzeJSPContent(content) {
    const patterns = new Set();
    const dependencies = new Set();

    // Look for JSP patterns
    if (content.includes('<%@')) patterns.add('jsp_directive');
    if (content.includes('<%=')) patterns.add('jsp_expression');
    if (content.includes('<%')) patterns.add('jsp_scriptlet');
    if (content.includes('${')) patterns.add('el_expression');
    if (content.includes('<c:')) patterns.add('jstl_core');
    if (content.includes('<fmt:')) patterns.add('jstl_fmt');

    // Extract imports and dependencies
    const importMatches = content.match(/<%@\s+page\s+import="([^"]+)"/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const imports = match.match(/"([^"]+)"/)[1];
        imports.split(',').forEach(imp => dependencies.add(imp.trim()));
      });
    }

    return {
      patterns: Array.from(patterns),
      dependencies: Array.from(dependencies),
      hasJSTL: patterns.has('jstl_core') || patterns.has('jstl_fmt'),
      hasEL: patterns.has('el_expression'),
      complexity: this._calculateComplexity(content)
    };
  }

  _analyzeJavaContent(content, filePath) {
    const patterns = new Set();
    const fileName = path.basename(filePath);

    // Identify file types
    const isController = content.includes('@WebServlet') || content.includes('extends HttpServlet');
    const isStrategy = fileName.includes('Strategy') || content.includes('implements Strategy');
    const isRepository = fileName.includes('Repository') || content.includes('Repository');

    // Look for patterns
    if (content.includes('@WebServlet')) patterns.add('servlet_annotation');
    if (content.includes('doGet')) patterns.add('http_get');
    if (content.includes('doPost')) patterns.add('http_post');
    if (content.includes('RequestDispatcher')) patterns.add('request_dispatcher');
    if (content.includes('sendRedirect')) patterns.add('redirect');
    if (content.includes('HttpSession')) patterns.add('session_management');

    return {
      isController,
      isStrategy,
      isRepository,
      patterns: Array.from(patterns),
      complexity: this._calculateComplexity(content)
    };
  }

  _calculateComplexity(content) {
    const lines = content.split('\n').length;
    const methods = (content.match(/public\s+\w+\s+\w+\s*\(/g) || []).length;
    const conditions = (content.match(/if\s*\(/g) || []).length;

    return {
      lines,
      methods,
      conditions,
      score: lines + methods * 2 + conditions * 3
    };
  }

  async _generateConversionPlan(jspAnalysis, servletAnalysis) {
    const plan = {
      tasks: [],
      transformations: [],
      recommendations: []
    };

    // Analyze servlets and generate Spring Boot controllers
    servletAnalysis.controllers.forEach(controller => {
      plan.tasks.push({
        type: 'convert_servlet_to_controller',
        source: controller.path,
        target: controller.path.replace('/servlet/', '/controller/'),
        priority: 'high'
      });
    });

    // Convert JSP files to Thymeleaf templates
    jspAnalysis.files.forEach(jsp => {
      plan.tasks.push({
        type: 'convert_jsp_to_thymeleaf',
        source: jsp.path,
        target: jsp.path.replace('.jsp', '.html').replace('/webapp/', '/templates/'),
        priority: 'medium'
      });
    });

    // Generate configuration files
    plan.tasks.push({
      type: 'generate_spring_boot_config',
      target: 'application.yml',
      priority: 'high'
    });

    return plan;
  }

  async _executeConversionPlan(plan, sourcePath, targetPath, _options, analysis) {
    const results = [];

    for (const task of plan.tasks) {
      try {
        logger.info(`Executing task: ${task.type}`);

        const result = await this._executeTask(task, sourcePath, targetPath, _options, analysis);
        results.push({
          task,
          result,
          success: true
        });
      } catch (error) {
        logger.error(`Task failed: ${task.type} - ${error.message}`);
        results.push({
          task,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  async _executeTask(task, sourcePath, targetPath, _options, analysis) {
    switch (task.type) {
    case 'convert_servlet_to_controller':
      return await this._convertServletToController(task, sourcePath, targetPath);
    case 'convert_jsp_to_thymeleaf':
      return await this._convertJSPToThymeleaf(task, sourcePath, targetPath);
    case 'generate_spring_boot_config':
      return await this._generateSpringBootConfig(task, targetPath, analysis);
    default:
      throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async _convertServletToController(task, sourcePath, targetPath) {
    const readTool = this.tools.get('read_file');
    const writeTool = this.tools.get('write_file');

    const sourceContent = await readTool.execute({ filePath: task.source });
    if (!sourceContent.success) {
      throw new Error(sourceContent.error);
    }

    // Transform servlet to Spring Boot controller
    const transformedContent = this._transformServletToController(sourceContent.content);

    const targetFilePath = path.join(targetPath, task.target);
    const writeResult = await writeTool.execute({
      filePath: targetFilePath,
      content: transformedContent
    });

    return writeResult;
  }

  async _convertJSPToThymeleaf(task, sourcePath, targetPath) {
    const sourceFilePath = path.resolve(sourcePath, task.source);
    const targetFilePath = path.join(targetPath, task.target);

    // Use the JSP to Thymeleaf transformer
    const result = await this.jspTransformer.transformJSPFile(sourceFilePath, targetFilePath);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }

  _transformServletToController(content) {
    // Basic servlet to Spring Boot controller transformation
    let transformed = content;

    // Replace servlet annotations with Spring annotations
    transformed = transformed.replace(/@WebServlet.*\n/g, '@RestController\n@RequestMapping("/api")\n');
    transformed = transformed.replace(/extends HttpServlet/, 'extends Object');

    // Transform doGet/doPost methods
    transformed = transformed.replace(
      /protected void doGet\(HttpServletRequest request, HttpServletResponse response\)/g,
      '@GetMapping\npublic ResponseEntity<?> get(HttpServletRequest request, HttpServletResponse response)'
    );

    transformed = transformed.replace(
      /protected void doPost\(HttpServletRequest request, HttpServletResponse response\)/g,
      '@PostMapping\npublic ResponseEntity<?> post(HttpServletRequest request, HttpServletResponse response)'
    );

    // Add Spring imports
    const imports = `import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
`;

    // Insert imports after package declaration
    transformed = transformed.replace(/(package [^;]+;)/, `$1\n\n${imports}`);

    return transformed;
  }

  _transformJSPToThymeleaf(content) {
    // Basic JSP to Thymeleaf transformation
    let transformed = content;

    // First, replace JSTL forEach with Thymeleaf (before touching EL expressions)
    // Use multiline regex to handle content spanning lines
    transformed = transformed.replace(
      /<c:forEach\s+var="([^"]+)"\s+items="\$\{([^}]+)\}">([^]*?)<\/c:forEach>/g,
      '<div th:each="$1 : ${$2}">$3</div>'
    );

    // Then replace remaining JSP expressions with Thymeleaf
    transformed = transformed.replace(/\$\{([^}]+)\}/g, '<span th:text="${$1}"></span>');

    // Add Thymeleaf namespace
    if (!transformed.includes('xmlns:th=')) {
      transformed = transformed.replace(
        /<html([^>]*)>/,
        '<html$1 xmlns:th="http://www.thymeleaf.org">'
      );
    }

    return transformed;
  }

  async _generateSpringBootConfig(task, targetPath, projectAnalysis) {
    // Use the Spring Boot configuration generator
    const result = await this.configGenerator.generateConfiguration(
      { logicAnalysis: projectAnalysis },
      targetPath,
      {
        applicationName: 'jsp-converted-app',
        basePackage: 'com.example.app',
        serverPort: 8080
      }
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  }

  async useTool(toolName, params) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    return await tool.execute(params);
  }

  getAvailableTools() {
    return Array.from(this.tools.keys());
  }
}

module.exports = JSPToSpringBootAgent;
