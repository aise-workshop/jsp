/**
 * Tests for the Transformers
 */

const JSPToThymeleafTransformer = require('../src/transformers/JSPToThymeleafTransformer');
const SpringBootConfigGenerator = require('../src/transformers/SpringBootConfigGenerator');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('JSPToThymeleafTransformer', () => {
  let transformer;
  let tempDir;

  beforeEach(async () => {
    transformer = new JSPToThymeleafTransformer();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jsp-transformer-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Basic JSP Transformation', () => {
    test('should transform simple JSP to Thymeleaf', async () => {
      const jspContent = `<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <c:out value="\${message}" />
</body>
</html>`;

      const inputFile = path.join(tempDir, 'test.jsp');
      const outputFile = path.join(tempDir, 'test.html');

      await fs.writeFile(inputFile, jspContent);

      const result = await transformer.transformJSPFile(inputFile, outputFile);

      expect(result.success).toBe(true);
      expect(result.source).toBe(inputFile);
      expect(result.target).toBe(outputFile);

      const transformedContent = await fs.readFile(outputFile, 'utf8');
      expect(transformedContent).toContain('xmlns:th="http://www.thymeleaf.org"');
      expect(transformedContent).toContain('<span th:text="${message}"></span>');
    });

    test('should transform JSTL forEach loops', async () => {
      const jspContent = `<html>
<body>
    <c:forEach var="item" items="\${items}">
        <p><c:out value="\${item.name}" /></p>
    </c:forEach>
</body>
</html>`;

      const inputFile = path.join(tempDir, 'loop.jsp');
      const outputFile = path.join(tempDir, 'loop.html');

      await fs.writeFile(inputFile, jspContent);

      const result = await transformer.transformJSPFile(inputFile, outputFile);

      expect(result.success).toBe(true);

      const transformedContent = await fs.readFile(outputFile, 'utf8');
      expect(transformedContent).toContain('th:each="item : ${items}"');
      expect(transformedContent).toContain('<span th:text="${item.name}"></span>');
    });

    test('should transform JSTL conditional statements', async () => {
      const jspContent = `<html>
<body>
    <c:if test="\${user.isAdmin}">
        <p>Admin Panel</p>
    </c:if>
</body>
</html>`;

      const inputFile = path.join(tempDir, 'condition.jsp');
      const outputFile = path.join(tempDir, 'condition.html');

      await fs.writeFile(inputFile, jspContent);

      const result = await transformer.transformJSPFile(inputFile, outputFile);

      expect(result.success).toBe(true);

      const transformedContent = await fs.readFile(outputFile, 'utf8');
      expect(transformedContent).toContain('th:if="${user.isAdmin}"');
    });

    test('should provide transformation summary', async () => {
      const jspContent = `<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<body>
    <form action="/submit" method="post">
        <input type="text" name="username" />
    </form>
    <c:forEach var="item" items="\${items}">
        <c:out value="\${item}" />
    </c:forEach>
</body>
</html>`;

      const inputFile = path.join(tempDir, 'summary.jsp');
      const outputFile = path.join(tempDir, 'summary.html');

      await fs.writeFile(inputFile, jspContent);

      const result = await transformer.transformJSPFile(inputFile, outputFile);

      expect(result.success).toBe(true);
      expect(result.transformations).toBeDefined();
      expect(result.transformations.jstlTagsTransformed).toBeGreaterThan(0);
      expect(result.transformations.directivesRemoved).toBeGreaterThan(0);
      expect(result.transformations.formsTransformed).toBeGreaterThan(0);
    });
  });

  describe('Multiple File Transformation', () => {
    test('should transform multiple JSP files', async () => {
      const jspFiles = [
        path.join(tempDir, 'page1.jsp'),
        path.join(tempDir, 'page2.jsp')
      ];

      await fs.writeFile(jspFiles[0], '<html><body><c:out value="${msg1}" /></body></html>');
      await fs.writeFile(jspFiles[1], '<html><body><c:out value="${msg2}" /></body></html>');

      const outputDir = path.join(tempDir, 'output');
      const result = await transformer.transformMultipleFiles(jspFiles, outputDir);

      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(2);
      expect(result.successfulTransformations).toBe(2);
      expect(result.failedTransformations).toBe(0);
    });
  });
});

describe('SpringBootConfigGenerator', () => {
  let generator;
  let tempDir;

  beforeEach(async () => {
    generator = new SpringBootConfigGenerator();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'spring-config-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Configuration Generation', () => {
    test('should generate basic Spring Boot configuration', async () => {
      const projectAnalysis = {
        logicAnalysis: {
          securityPatterns: {
            authenticationMechanisms: [],
            authorizationChecks: [],
            sessionSecurity: []
          }
        }
      };

      const result = await generator.generateConfiguration(projectAnalysis, tempDir);

      expect(result.success).toBe(true);
      expect(result.results.applicationYml).toBeDefined();
      expect(result.results.pomXml).toBeDefined();
      expect(result.results.mainClass).toBeDefined();

      // Check if files were created
      const appYmlPath = path.join(tempDir, 'src', 'main', 'resources', 'application.yml');
      const pomPath = path.join(tempDir, 'pom.xml');
      const mainClassPath = path.join(tempDir, 'src', 'main', 'java', 'com', 'example', 'app', 'Application.java');

      expect(await fs.pathExists(appYmlPath)).toBe(true);
      expect(await fs.pathExists(pomPath)).toBe(true);
      expect(await fs.pathExists(mainClassPath)).toBe(true);
    });

    test('should generate security configuration when needed', async () => {
      const projectAnalysis = {
        logicAnalysis: {
          securityPatterns: {
            authenticationMechanisms: [{ type: 'custom' }],
            authorizationChecks: [],
            sessionSecurity: []
          }
        }
      };

      const result = await generator.generateConfiguration(projectAnalysis, tempDir);

      expect(result.success).toBe(true);
      expect(result.results.securityConfig).toBeDefined();

      const securityConfigPath = path.join(tempDir, 'src', 'main', 'java', 'com', 'example', 'app', 'config', 'SecurityConfig.java');
      expect(await fs.pathExists(securityConfigPath)).toBe(true);
    });

    test('should generate application.yml with correct structure', async () => {
      const projectAnalysis = { logicAnalysis: { securityPatterns: { authenticationMechanisms: [], authorizationChecks: [], sessionSecurity: [] } } };

      const result = await generator.generateConfiguration(projectAnalysis, tempDir, {
        serverPort: 9090,
        applicationName: 'test-app',
        databaseUrl: 'jdbc:postgresql://localhost:5432/testdb'
      });

      expect(result.success).toBe(true);

      const appYmlPath = path.join(tempDir, 'src', 'main', 'resources', 'application.yml');
      const content = await fs.readFile(appYmlPath, 'utf8');

      expect(content).toContain('port: 9090');
      expect(content).toContain('name: test-app');
      expect(content).toContain('url: jdbc:postgresql://localhost:5432/testdb');
    });

    test('should generate pom.xml with correct dependencies', async () => {
      const projectAnalysis = { logicAnalysis: { securityPatterns: { authenticationMechanisms: [], authorizationChecks: [], sessionSecurity: [] } } };

      const result = await generator.generateConfiguration(projectAnalysis, tempDir, {
        groupId: 'com.test',
        artifactId: 'test-app',
        version: '2.0.0'
      });

      expect(result.success).toBe(true);

      const pomPath = path.join(tempDir, 'pom.xml');
      const content = await fs.readFile(pomPath, 'utf8');

      expect(content).toContain('<groupId>com.test</groupId>');
      expect(content).toContain('<artifactId>test-app</artifactId>');
      expect(content).toContain('<version>2.0.0</version>');
      expect(content).toContain('spring-boot-starter-web');
      expect(content).toContain('spring-boot-starter-thymeleaf');
    });
  });
});
