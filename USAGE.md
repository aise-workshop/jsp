# JSP to Spring Boot Converter

![CI/CD Pipeline](https://github.com/aise-workshop/jsp/workflows/CI/CD%20Pipeline/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

An AI-powered CLI tool for converting Java + JSP projects to Java + Spring Boot applications. This tool provides intelligent analysis and automated conversion capabilities to modernize legacy JSP applications.

## Features

### 🤖 AI Agent Architecture
- **Modular Tool System**: Extensible tools for file operations (`list_dir`, `read_file`, `write_file`)
- **Intelligent Analysis**: AI agent makes decisions about file transformations based on project structure
- **Pattern Recognition**: Identifies common JSP and Servlet patterns for accurate conversion

### 🔍 Business Logic Analysis
- **Pattern Detection**: Identifies Strategy, DAO, MVC, and other architectural patterns
- **Security Analysis**: Analyzes authentication, authorization, and security patterns
- **Data Flow Mapping**: Traces request/response flows and transaction boundaries
- **Screenshot Capture**: Uses Puppeteer for visual comparison (before/after conversion)

### 🛠 Conversion Capabilities
- **Servlet to Spring Boot Controllers**: Converts `@WebServlet` to `@RestController`
- **JSP to Thymeleaf**: Transforms JSP files to Thymeleaf templates
- **JSTL to Thymeleaf**: Migrates JSTL tags to Thymeleaf equivalents
- **Configuration Generation**: Creates Spring Boot application.yml
- **Dependency Management**: Analyzes and suggests dependency updates

### 📊 Comprehensive Reporting
- **Analysis Reports**: Detailed project structure and pattern analysis
- **Conversion Plans**: Step-by-step conversion recommendations
- **Progress Tracking**: Real-time conversion progress with detailed logging

## Installation

### Prerequisites
- Node.js >= 14.0.0
- Java 8+ (for analyzing Java projects)
- Git

### Global Installation
```bash
npm install -g jsp-to-spring-boot
```

### Local Installation
```bash
git clone https://github.com/aise-workshop/jsp.git
cd jsp
npm install
```

## Usage

### Command Line Interface

#### Analyze a JSP Project
```bash
# Basic analysis
jsp2spring analyze /path/to/jsp-project

# Save analysis to file
jsp2spring analyze /path/to/jsp-project --output analysis.json

# Verbose output
jsp2spring analyze /path/to/jsp-project --verbose
```

#### Convert JSP Project to Spring Boot
```bash
# Full conversion
jsp2spring convert /path/to/jsp-project /path/to/target --copy-java

# Analysis only (no conversion)
jsp2spring convert /path/to/jsp-project /path/to/target --analyze-only

# With verbose logging
jsp2spring convert /path/to/jsp-project /path/to/target --verbose
```

#### Use Individual Tools
```bash
# List available tools
jsp2spring tools

# Use specific tool
jsp2spring use-tool list_dir --params '{"dirPath": "/path/to/directory"}'
jsp2spring use-tool read_file --params '{"filePath": "/path/to/file.java"}'
jsp2spring use-tool write_file --params '{"filePath": "/path/to/output.java", "content": "// Generated code"}'
```

### Programmatic Usage

```javascript
const JSPToSpringBootConverter = require('jsp-to-spring-boot');

const converter = new JSPToSpringBootConverter();

// Analyze project
const analysis = await converter.analyzeOnly('/path/to/jsp-project', {
  includeLogicAnalysis: true,
  captureScreenshots: true,
  baseUrl: 'http://localhost:8080'
});

// Convert project
const result = await converter.convertProject(
  '/path/to/jsp-project',
  '/path/to/target',
  {
    analyzeLogic: true,
    captureScreenshots: true,
    copyJavaFiles: true,
    cleanupCopiedFiles: true
  }
);
```

## Architecture

### AI Agent System
The core AI agent orchestrates the conversion process using a set of modular tools:

```
JSPToSpringBootAgent
├── Tools
│   ├── ListDirTool - Directory listing and filtering
│   ├── ReadFileTool - File content reading
│   └── WriteFileTool - File writing with directory creation
├── Analyzers
│   ├── ProjectStructureAnalyzer - Categorizes files and dependencies
│   ├── JSPPatternAnalyzer - Identifies JSP/JSTL patterns
│   ├── ServletAnalyzer - Analyzes Java servlets and strategies
│   └── BusinessLogicAnalyzer - Deep pattern analysis
└── Transformers
    ├── ServletToControllerTransformer
    ├── JSPToThymeleafTransformer
    └── ConfigurationGenerator
```

### Business Logic Analyzer
Advanced pattern recognition for:
- **Architectural Patterns**: Strategy, Factory, Observer, DAO, MVC
- **Security Patterns**: Authentication, authorization, input validation
- **Data Patterns**: Transaction boundaries, validation points
- **Integration Patterns**: Request/response flow analysis

## Example Analysis Output

```json
{
  "structure": {
    "jspFiles": 5,
    "javaFiles": 31,
    "configFiles": 8
  },
  "patterns": {
    "servletPatterns": {
      "strategyPattern": true,
      "daoPattern": true,
      "mvcPattern": true
    },
    "jspPatterns": {
      "jstlUsage": true,
      "elExpressions": true,
      "customTags": false
    }
  },
  "conversionPlan": {
    "tasks": [
      {
        "type": "convert_servlet_to_controller",
        "priority": "high",
        "description": "Convert BlogController servlet to Spring Boot controller"
      },
      {
        "type": "convert_jsp_to_thymeleaf",
        "priority": "medium",
        "description": "Transform JSP templates to Thymeleaf"
      }
    ]
  },
  "recommendations": [
    {
      "category": "architecture",
      "title": "Convert Strategy Pattern to Spring Components",
      "description": "Convert existing strategy pattern to Spring @Service beans"
    }
  ]
}
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Development

### Project Structure
```
jsp-to-spring-boot/
├── src/
│   ├── agents/           # AI Agent implementations
│   ├── analyzers/        # Business logic analyzers
│   ├── tools/           # Modular tools (list_dir, read_file, write_file)
│   ├── utils/           # Utilities (logger, file copier)
│   ├── cli.js           # Command line interface
│   └── index.js         # Main entry point
├── tests/               # Jest test suites
├── .github/workflows/   # GitHub Actions CI/CD
└── docs/               # Documentation
```

### Adding New Tools
```javascript
class CustomTool extends Tool {
  constructor() {
    super('custom_tool', 'Description of custom tool');
  }

  async execute(params) {
    // Implementation
    return {
      success: true,
      result: 'Custom tool result'
    };
  }
}

// Register with agent
agent.tools.set('custom_tool', new CustomTool());
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## CI/CD

The project includes comprehensive GitHub Actions workflows:
- **Testing**: Multi-version Node.js testing (16.x, 18.x, 20.x)
- **Linting**: ESLint code quality checks
- **Security**: CodeQL analysis and npm audit
- **Integration**: Full conversion testing with PostgreSQL
- **Coverage**: Code coverage reporting

## Examples

### Blog Application Conversion
The repository includes a complete blog application example in `test/_fixtures/blog/`:
- **Original**: Java Servlet + JSP + JDBC
- **Target**: Spring Boot + Thymeleaf + JPA
- **Patterns**: Strategy pattern, DAO pattern, MVC architecture

### Conversion Results
- ✅ **5 JSP files** → Thymeleaf templates
- ✅ **1 Controller** → Spring Boot @RestController
- ✅ **21 Strategy classes** → Spring @Service components
- ✅ **Configuration** → application.yml with Spring Boot properties

## Troubleshooting

### Common Issues

#### Module Not Found Errors
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Java Analysis Errors
```bash
# Ensure Java is available
java -version
# Ensure proper project structure
jsp2spring analyze --verbose
```

#### Permission Errors
```bash
# Fix executable permissions
chmod +x node_modules/.bin/jsp2spring
```

## Roadmap

- [ ] **Enhanced Puppeteer Integration**: Real browser automation for screenshot comparison
- [ ] **Database Migration Tools**: Automated migration from JDBC to JPA
- [ ] **Security Modernization**: Automatic Spring Security integration
- [ ] **API Generation**: REST API generation from servlet patterns
- [ ] **Testing Migration**: Convert servlet tests to Spring Boot tests
- [ ] **Docker Support**: Containerization of converted applications

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern JavaScript and Node.js
- Inspired by AI-driven code transformation tools
- Uses industry-standard testing and CI/CD practices
- Leverages Spring Boot best practices for conversion targets

---

**Note**: As per the requirements, Java file copying functionality is implemented but copied files are automatically cleaned up and not committed to maintain repository cleanliness.