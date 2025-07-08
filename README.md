# jsp

我正在使用 JavaScript 实现一个 Java + JSP 转 Java + Spring Boot 的 CLI 工具。

1. `test/_fixtures` 是我用来测试的 JSP 项目
2. `target` 目录是 Spring Boot 的工程

现在我，需要你实现如下的功能：

1. 实现基本的 Java 文件复制
2. 设计一个 AI Agent。
   - 参考你（GitHub Copilot）的工具设计，创建几个基本的 Tool 来转换 JSP 工具
       - `list_dir`
       - `read_file`
       - `write_file`
   - AI Agent 第一步根据需求来调用工具，决定转换某些文件，或者修改哪个文件
   - 执行对应的工具


你先帮我实现基本的轮库。

## 实现状态

✅ **基本功能已实现！**

### 1. 基本的 Java 文件复制
- `JavaFileCopier` 类实现了 Java 文件的递归复制功能
- 支持获取统计信息和批量复制

### 2. AI Agent 设计
- 基本工具已实现：
  - ✅ `list_dir` - 列出目录内容
  - ✅ `read_file` - 读取文件内容
  - ✅ `write_file` - 写入文件内容
- AI Agent 工作流程：
  - ✅ 第一步：分析项目结构，决定转换计划
  - ✅ 执行对应的工具进行转换

### 3. CLI 工具
提供了完整的命令行界面：

```bash
# 分析项目结构
node index.js analyze

# 执行完整转换
node index.js convert

# 只复制 Java 文件
node index.js copy-java

# 显示帮助
node index.js help
```

### 4. 测试套件
- 完整的测试套件验证所有功能
- 运行测试：`node test.js`

### 使用示例
```bash
# 分析 JSP 项目
node index.js analyze

# 转换到 Spring Boot
node index.js convert

# 自定义源目录和目标目录
node index.js --source ./my-jsp-project --target ./my-spring-boot-project convert
```

