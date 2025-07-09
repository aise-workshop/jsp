# JSP 到 Spring Boot 迁移实施指南

## 快速开始

基于 `IMPROVEMENT_PLAN.md` 的详细规划，本指南提供了具体的实施步骤和代码示例。

## 第一步：立即可实施的改进

### 1. 增强现有分析器

在 `src/analyzers/` 目录下创建新的分析器：

<augment_code_snippet path="src/analyzers/EnhancedJSPAnalyzer.js" mode="EXCERPT">
````javascript
// src/analyzers/EnhancedJSPAnalyzer.js
class EnhancedJSPAnalyzer {
  analyzeComplexity(content) {
    return {
      scriptletCount: (content.match(/<%[^@]/g) || []).length,
      jstlTagCount: (content.match(/<c:/g) || []).length,
      elExpressionCount: (content.match(/\$\{[^}]+\}/g) || []).length,
      customTagCount: (content.match(/<[a-zA-Z]+:/g) || []).length
    };
  }

  extractDependencies(content) {
    const imports = [];
    const importMatches = content.match(/<%@\s+page\s+import="([^"]+)"/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const importList = match.match(/"([^"]+)"/)[1];
        imports.push(...importList.split(',').map(imp => imp.trim()));
      });
    }
    return imports;
  }
}
````
</augment_code_snippet>

### 2. 添加技术债务评估

<augment_code_snippet path="src/analyzers/TechnicalDebtAnalyzer.js" mode="EXCERPT">
````javascript
// src/analyzers/TechnicalDebtAnalyzer.js
class TechnicalDebtAnalyzer {
  calculateDebtScore(jspAnalysis) {
    let score = 0;

    // 基于复杂度计算
    score += jspAnalysis.complexity.scriptletCount * 3; // Scriptlet 权重高
    score += jspAnalysis.complexity.jstlTagCount * 1;   // JSTL 相对简单
    score += jspAnalysis.complexity.customTagCount * 5; // 自定义标签最复杂

    return {
      score,
      priority: score > 50 ? 'high' : score > 20 ? 'medium' : 'low',
      recommendations: this.generateRecommendations(jspAnalysis)
    };
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.complexity.scriptletCount > 10) {
      recommendations.push('高优先级：大量 Scriptlet 代码需要重构到后端服务');
    }

    if (analysis.complexity.customTagCount > 0) {
      recommendations.push('中优先级：自定义标签需要转换为 Vue 组件');
    }

    return recommendations;
  }
}
````
</augment_code_snippet>

### 3. 改进 CLI 输出

更新 `src/cli.js` 中的分析结果显示：

<augment_code_snippet path="src/cli.js" mode="EXCERPT">
````javascript
function displayAnalysisSummary(analysis) {
  console.log(chalk.yellow('\n📊 详细分析报告:'));

  // 显示技术债务评估
  if (analysis.technicalDebt) {
    console.log(chalk.red(`\n💳 技术债务评分: ${analysis.technicalDebt.score}`));
    console.log(chalk.gray(`优先级: ${analysis.technicalDebt.priority}`));

    if (analysis.technicalDebt.recommendations.length > 0) {
      console.log(chalk.yellow('\n📋 改进建议:'));
      analysis.technicalDebt.recommendations.forEach((rec, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${rec}`));
      });
    }
  }

  // 显示复杂度分析
  console.log(chalk.blue('\n🔍 复杂度分析:'));
  console.log(chalk.gray(`Scriptlet 数量: ${analysis.complexity?.scriptletCount || 0}`));
  console.log(chalk.gray(`JSTL 标签数量: ${analysis.complexity?.jstlTagCount || 0}`));
  console.log(chalk.gray(`自定义标签数量: ${analysis.complexity?.customTagCount || 0}`));
}
````
</augment_code_snippet>

## 第二步：集成 OpenRewrite（Node.js 调用 Java）

### 1. 添加 Java 依赖管理

创建 `scripts/setup-openrewrite.js`：

<augment_code_snippet path="scripts/setup-openrewrite.js" mode="EXCERPT">
````javascript
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function setupOpenRewrite() {
  const mavenDir = path.join(process.cwd(), 'java-tools');

  // 创建 Maven 项目结构
  await fs.ensureDir(mavenDir);

  // 生成 pom.xml
  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.jsp2spring</groupId>
    <artifactId>rewrite-tools</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <rewrite.version>8.21.0</rewrite.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.openrewrite</groupId>
            <artifactId>rewrite-java</artifactId>
            <version>\${rewrite.version}</version>
        </dependency>
        <dependency>
            <groupId>org.openrewrite</groupId>
            <artifactId>rewrite-spring</artifactId>
            <version>\${rewrite.version}</version>
        </dependency>
    </dependencies>
</project>`;

  await fs.writeFile(path.join(mavenDir, 'pom.xml'), pomXml);

  // 下载依赖
  execSync('mvn dependency:resolve', { cwd: mavenDir, stdio: 'inherit' });

  console.log('✅ OpenRewrite 工具链设置完成');
}

module.exports = { setupOpenRewrite };
````
</augment_code_snippet>

### 2. 创建 OpenRewrite 包装器

<augment_code_snippet path="src/tools/OpenRewriteTool.js" mode="EXCERPT">
````javascript
// src/tools/OpenRewriteTool.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

class OpenRewriteTool {
  constructor() {
    this.name = 'openrewrite';
    this.javaToolsDir = path.join(process.cwd(), 'java-tools');
  }

  async execute(params) {
    const { recipeName, sourcePath, targetPath } = params;

    try {
      // 构建 OpenRewrite 命令
      const command = `mvn org.openrewrite.maven:rewrite-maven-plugin:run ` +
                     `-Drewrite.activeRecipes=${recipeName} ` +
                     `-DsourcePath=${sourcePath} ` +
                     `-DtargetPath=${targetPath}`;

      const result = execSync(command, {
        cwd: this.javaToolsDir,
        encoding: 'utf8'
      });

      return {
        success: true,
        result: result,
        recipeName,
        filesProcessed: this.extractProcessedFiles(result)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractProcessedFiles(output) {
    // 解析 OpenRewrite 输出，提取处理的文件列表
    const lines = output.split('\n');
    const processedFiles = [];

    lines.forEach(line => {
      if (line.includes('Changed')) {
        const match = line.match(/Changed\s+(.+\.java)/);
        if (match) {
          processedFiles.push(match[1]);
        }
      }
    });

    return processedFiles;
  }
}

module.exports = OpenRewriteTool;
````
</augment_code_snippet>

## 第三步：Vue.js 集成准备

### 1. 创建 Vue 项目生成器

<augment_code_snippet path="src/generators/VueProjectGenerator.js" mode="EXCERPT">
````javascript
// src/generators/VueProjectGenerator.js
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class VueProjectGenerator {
  async generateProject(targetPath, options = {}) {
    const {
      projectName = 'jsp-migrated-frontend',
      useTypeScript = true,
      useRouter = true,
      usePinia = true
    } = options;

    const frontendPath = path.join(targetPath, 'frontend');

    // 创建 Vite + Vue 项目
    const createCommand = `npm create vue@latest ${projectName} -- ` +
                         `${useTypeScript ? '--typescript' : ''} ` +
                         `${useRouter ? '--router' : ''} ` +
                         `${usePinia ? '--pinia' : ''} ` +
                         `--eslint --prettier`;

    execSync(createCommand, { cwd: targetPath, stdio: 'inherit' });

    // 安装额外依赖
    const additionalDeps = [
      'axios',           // HTTP 客户端
      'vue-router@4',    // 路由
      'pinia',           // 状态管理
      '@vueuse/core'     // Vue 工具库
    ];

    execSync(`npm install ${additionalDeps.join(' ')}`, {
      cwd: path.join(targetPath, projectName),
      stdio: 'inherit'
    });

    return {
      success: true,
      projectPath: path.join(targetPath, projectName),
      message: `Vue.js 项目已创建: ${projectName}`
    };
  }
}

module.exports = VueProjectGenerator;
````
</augment_code_snippet>

## 使用示例

### 1. 设置工具链
```bash
npm run start -- setup
```

### 2. 分析项目（增强版）
```bash
npm run start -- analyze test/_fixtures/blog --output analysis.json
```

### 3. 生成 Vue 项目
```bash
npm run start -- generate-vue ./output --name my-frontend-app
```

### 4. 使用 OpenRewrite 工具
```bash
npm run start -- use-tool openrewrite --params '{"recipeName":"org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0","sourcePath":"./src","targetPath":"./output"}'
```

## 立即可执行的改进清单

### ✅ 第一周：基础增强
- [ ] 创建 `EnhancedJSPAnalyzer.js`
- [ ] 创建 `TechnicalDebtAnalyzer.js`
- [ ] 更新 CLI 输出格式
- [ ] 添加复杂度分析功能

### ✅ 第二周：工具集成
- [ ] 设置 OpenRewrite 工具链
- [ ] 创建 `OpenRewriteTool.js`
- [ ] 添加 `setup` CLI 命令
- [ ] 测试基础重构功能

### ✅ 第三周：Vue.js 基础
- [ ] 创建 `VueProjectGenerator.js`
- [ ] 创建 `JSPToVueTransformer.js`
- [ ] 添加 `generate-vue` CLI 命令
- [ ] 实现基础组件转换

### ✅ 第四周：集成测试
- [ ] 编写单元测试
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 文档完善

## 技术栈升级路径

### 当前技术栈
```
Node.js + JavaScript
├── Commander.js (CLI)
├── Winston (日志)
├── Puppeteer (截图)
└── Jest (测试)
```

### 目标技术栈
```
Node.js + JavaScript + Java
├── Commander.js (CLI)
├── Winston (日志)
├── ANTLR 4 (JSP 解析)
├── JavaParser (Java 分析)
├── OpenRewrite (代码重构)
├── Vue 3 + Vite (前端)
└── Jest + Maven (测试)
```

## 预期收益

### 短期收益（1-2 个月）
- **分析准确率提升 50%**：通过增强的分析器
- **自动化程度提升 30%**：通过 OpenRewrite 集成
- **开发效率提升 25%**：通过改进的工具链

### 中期收益（3-6 个月）
- **迁移速度提升 70%**：通过完整的自动化流程
- **代码质量提升 60%**：通过现代化架构
- **维护成本降低 40%**：通过技术债务清理

### 长期收益（6-12 个月）
- **完整的企业级解决方案**：支持大规模迁移项目
- **可复用的工具链**：适用于多种类似项目
- **团队技能提升**：掌握现代化开发技术

## 风险控制

### 技术风险
- **渐进式实施**：每周小步迭代，降低风险
- **向后兼容**：保持现有功能不受影响
- **充分测试**：每个新功能都有对应测试

### 项目风险
- **时间可控**：每个阶段都有明确的时间目标
- **资源合理**：基于现有代码库进行增强
- **可回退**：每个改进都是独立的模块

## 下一步行动

1. **立即开始**：创建 `EnhancedJSPAnalyzer.js`
2. **本周完成**：技术债务分析功能
3. **下周目标**：OpenRewrite 工具集成
4. **月度目标**：Vue.js 转换器完成

这个实施指南提供了从当前基础工具到企业级迁移解决方案的清晰升级路径，每个步骤都是可执行的，风险可控的。