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

## 🚀 项目改进和优化计划

基于 `docs/SOLUTION.md` 的深度分析，我们制定了全面的改进计划，将当前的基础工具升级为企业级迁移解决方案：

### 📋 改进路线图

#### 🔍 阶段 1：核心分析引擎升级（进行中）
- **ANTLR JSP 解析器**：支持混合语言（HTML + Java）解析
- **JavaParser 集成**：分析编译后的 Servlet 代码
- **混合分析引擎**：结合表示层和业务逻辑分析
- **技术债务分析器**：量化评估和优先级排序

#### ⚙️ 阶段 2：自动化重构工具集成
- **OpenRewrite 框架**：集成企业级重构工具
- **自定义配方开发**：DAO 到 JPA、有状态到无状态转换
- **批量转换引擎**：支持大规模并行处理
- **质量验证机制**：确保转换的正确性

#### 🎨 阶段 3：现代化前端迁移
- **Vue.js 项目脚手架**：基于 Vite 的现代化前端
- **JSP 到 Vue 组件映射**：自动化组件转换
- **状态管理架构**：Pinia 替换 HttpSession
- **自定义标签库迁移**：复杂标签的组件化

#### 🏗️ 阶段 4：架构模式实施
- **绞杀者模式**：增量式现代化迁移
- **API 网关**：Spring Cloud Gateway 路由
- **数据库解耦**：渐进式数据同步
- **Saga 模式**：分布式事务处理

#### 🚀 阶段 5：企业级特性
- **JWT 认证系统**：无状态认证架构
- **DORA 指标监控**：DevOps 性能度量
- **性能优化框架**：缓存、连接池、JVM 调优
- **AI 辅助工具**：代码解释、重构建议

### 📚 详细文档

- **[完整改进计划](docs/IMPROVEMENT_PLAN.md)**：详细的技术方案和实施策略
- **[实施指南](docs/IMPLEMENTATION_GUIDE.md)**：具体的代码示例和操作步骤
- **[解决方案文档](docs/SOLUTION.md)**：理论基础和最佳实践

### 🎯 预期收益

- **迁移效率提升 70%**：通过自动化工具和现代化架构
- **代码质量提升 80%**：通过技术债务清理和重构
- **开发效率提升 40%**：通过现代化工具链和 AI 辅助
- **维护成本降低 60%**：通过架构优化和自动化

### 🛠️ 立即开始

```bash
# 1. 查看详细改进计划
cat docs/IMPROVEMENT_PLAN.md

# 2. 按照实施指南开始第一步
cat docs/IMPLEMENTATION_GUIDE.md

# 3. 运行现有分析功能
npm run start -- analyze test/_fixtures/blog

# 4. 开始实施第一个改进
# 创建增强的 JSP 分析器（参考实施指南）
```

这个改进计划将项目从当前的基础工具转变为功能完整的企业级迁移解决方案，支持从传统 JSP 应用到现代化 Spring Boot + Vue.js 架构的完整转型。
