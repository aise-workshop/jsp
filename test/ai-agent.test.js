const AIAgent = require('../lib/ai-agent');
const FileSystemTools = require('../lib/filesystem-tools');
const path = require('path');
const fs = require('fs-extra');

describe('AIAgent', () => {
  let agent;
  let testDir;

  beforeAll(async () => {
    agent = new AIAgent({ verbose: false });
    testDir = path.join(__dirname, '../tmp/test-conversion');
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  describe('File System Tools', () => {
    test('should list directory contents', async () => {
      const tools = new FileSystemTools();
      const items = await tools.listDirectory(__dirname);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    test('should read and write files', async () => {
      const tools = new FileSystemTools();
      const testFile = path.join(testDir, 'test.txt');
      const content = 'Hello World';
      
      await tools.writeFile(testFile, content);
      const readContent = await tools.readFile(testFile);
      
      expect(readContent).toBe(content);
    });
  });

  describe('JSP Conversion', () => {
    test('should convert JSP tags to Thymeleaf', async () => {
      const jspContent = `
        <%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
        <c:out value="\${post.title}"/>
        <c:forEach items="\${posts}" var="post">
          <p>\${post.content}</p>
        </c:forEach>
      `;
      
      const expectedThymeleaf = `
        xmlns:th="http://www.thymeleaf.org"
        [[\${post.title}]]
        <div th:each="post : \${posts}">
          <p>\${post.content}</p>
        </div>
      `;
      
      const testFile = path.join(testDir, 'test.jsp');
      const targetFile = path.join(testDir, 'test.html');
      
      await fs.writeFile(testFile, jspContent);
      await agent.convertJspToThymeleaf(testFile, targetFile);
      
      const result = await fs.readFile(targetFile, 'utf8');
      expect(result).toContain('xmlns:th="http://www.thymeleaf.org"');
      expect(result).toContain('[[\${post.title}]]');
      expect(result).toContain('<div th:each="post : [[posts]]">');
    });
  });

  describe('Project Analysis', () => {
    test('should analyze project structure', async () => {
      const fixturesPath = path.join(__dirname, '../test/_fixtures/blog');
      const structure = await agent.analyzeProject(fixturesPath);
      
      expect(structure.files.length).toBeGreaterThan(0);
      expect(structure.directories.length).toBeGreaterThan(0);
      
      // Should find JSP files
      const jspFiles = structure.files.filter(f => f.extension === '.jsp');
      expect(jspFiles.length).toBeGreaterThan(0);
      
      // Should find Java files  
      const javaFiles = structure.files.filter(f => f.extension === '.java');
      expect(javaFiles.length).toBeGreaterThan(0);
    });
  });
});