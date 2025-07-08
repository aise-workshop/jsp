# JSP to Spring Boot Converter

我正在使用 JavaScript 实现一个 Java + JSP 转 Java + Spring Boot 的 CLI 工具。

## 功能特性

该工具实现了以下功能：

1. **基本的 Java 文件复制** - 自动复制 Java 文件并更新包声明
2. **AI Agent 设计** - 参考 GitHub Copilot 的工具设计，创建基本的转换工具：
   - `list_dir` - 列出目录内容
   - `read_file` - 读取文件内容
   - `write_file` - 写入文件内容
3. **智能文件转换** - AI Agent 根据文件类型自动决定转换策略
4. **JSP 到 Thymeleaf 转换** - 将 JSP 语法转换为 Thymeleaf 模板
5. **项目结构重组** - 将传统 JSP 项目结构转换为 Spring Boot 项目结构

## 项目结构

- `test/_fixtures/blog` - 用于测试的 JSP 项目（博客应用）
- `target/` - 转换后的 Spring Boot 项目输出目录
- `src/` - CLI 工具的主要源代码
- `lib/` - 核心功能库
- `bin/` - 可执行 CLI 脚本

## 安装和使用

### 安装依赖
```bash
npm install
```

### 使用 CLI 工具
```bash
# 基本用法
node bin/cli.js convert

# 指定源和目标路径
node bin/cli.js convert --source /path/to/jsp/project --target /path/to/spring/boot/project

# 启用详细输出
node bin/cli.js convert --verbose
```

### 运行测试
```bash
npm test
```

### 代码格式化和检查
```bash
npm run lint
npm run format
```

## 转换规则

### JSP 到 Thymeleaf
- `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>` → `xmlns:th="http://www.thymeleaf.org"`
- `<c:out value="${expression}"/>` → `[[${expression}]]`
- `<c:forEach items="${list}" var="item">` → `<div th:each="item : ${list}">`

### 项目结构转换
- `src/main/webapp/` → `src/main/resources/templates/` (JSP 文件)
- `src/main/webapp/css/` → `src/main/resources/static/css/` (静态资源)
- 包名从 `com.shpota.blog` 更新为 `com.example.demo`

## 开发

### 核心组件

1. **FileSystemTools** (`lib/filesystem-tools.js`) - 提供基本的文件系统操作
2. **AIAgent** (`lib/ai-agent.js`) - 智能转换引擎
3. **JSPConverter** (`src/index.js`) - 主要的转换器类

### 添加新的转换规则

在 `lib/ai-agent.js` 中的 `loadConversionRules()` 方法中添加新的转换模式。

### 测试

测试文件位于 `test/` 目录中，使用 Jest 框架运行测试。

## CI/CD

项目包含 GitHub Actions 工作流，支持：
- 多版本 Node.js 测试 (16.x, 18.x, 20.x)
- 代码检查和格式化
- 自动化测试
- 包构建和发布

## 许可证

MIT License
