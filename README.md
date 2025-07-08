# JSP to Spring Boot Converter

![CI/CD Pipeline](https://github.com/aise-workshop/jsp/workflows/CI/CD%20Pipeline/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

An AI-powered CLI tool for converting Java + JSP projects to Java + Spring Boot applications.

## Quick Start

### Installation
```bash
npm install
```

### Analyze a JSP Project
```bash
npm run start -- analyze test/_fixtures/blog
```

### Convert JSP to Spring Boot (Analysis Mode)
```bash
npm run start -- convert test/_fixtures/blog target --analyze-only
```

### List Available Tools
```bash
npm run start -- tools
```

## Features

🤖 **AI Agent Architecture** - Intelligent analysis and decision-making for file transformations
🔍 **Business Logic Analysis** - Pattern detection and security analysis
🛠 **Automated Conversion** - Servlet → Spring Boot, JSP → Thymeleaf
📊 **Comprehensive Reporting** - Detailed analysis and conversion plans

## Architecture

The tool implements a modular AI Agent architecture:

1. **AI Agent**: Orchestrates the conversion process using intelligent analysis
2. **Tools**: Modular components (`list_dir`, `read_file`, `write_file`) for file operations
3. **Business Logic Analyzer**: Deep pattern analysis with optional Puppeteer integration for screenshots
4. **File Copier**: Java file copying with automatic cleanup (as per requirements)

## Project Structure

- `test/_fixtures/blog` - Sample JSP project for testing
- `target/` - Spring Boot target directory
- `src/agents/` - AI Agent implementations
- `src/tools/` - Modular tools for file operations
- `src/analyzers/` - Business logic analyzers
- `src/utils/` - Utilities including file copier

## Example Analysis Output

The tool provides comprehensive analysis of JSP projects:

```
📊 Analysis Summary:
JSP Files: 5
Java Files: 31
Controllers: 1
Strategies: 21
Repositories: 5

📋 Conversion Plan:
1. convert_servlet_to_controller (high priority)
2. convert_jsp_to_thymeleaf (medium priority)
3. generate_spring_boot_config (high priority)
```

## Implementation Details

### Key Requirements Implemented

1. ✅ **Basic Java file copying** - Implemented with automatic cleanup (files not committed)
2. ✅ **AI Agent with Tools** - Modular architecture with `list_dir`, `read_file`, `write_file`
3. ✅ **Business Logic Analysis** - Pattern detection with Puppeteer integration support
4. ✅ **Project-like Structure** - Complete with GitHub Actions, tests, and documentation

### AI Agent Decision Making

The AI Agent analyzes projects and makes intelligent decisions:
- Identifies file types and patterns (JSP, Servlets, Strategies)
- Generates conversion plans based on project structure
- Executes transformations using modular tools
- Provides recommendations for Spring Boot migration

### Modular Tool System

```javascript
// Use tools programmatically
const agent = new JSPToSpringBootAgent();

// List directory contents
await agent.useTool('list_dir', { dirPath: '/project/path' });

// Read file content
await agent.useTool('read_file', { filePath: '/file/path' });

// Write transformed content
await agent.useTool('write_file', { 
  filePath: '/output/path', 
  content: transformedContent 
});
```

## Testing

```bash
# Run all tests (30 tests passing)
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Documentation

📖 **[Complete Usage Guide](USAGE.md)** - Detailed documentation with examples
🔧 **[API Reference](src/)** - Source code with comprehensive comments
🧪 **[Test Examples](tests/)** - Unit and integration tests

## Development

The project follows modern JavaScript best practices:
- **ESLint** configuration for code quality
- **Jest** for comprehensive testing
- **GitHub Actions** for CI/CD
- **Winston** for structured logging
- **Modular architecture** for extensibility

## License

MIT License

---

**Note**: This tool is designed as a general-purpose converter with proper project structure including CI/CD, comprehensive testing, and modular architecture for future reusability.
