/**
 * Tests for the JSP to Spring Boot Agent
 */

const JSPToSpringBootAgent = require('../src/agents/JSPToSpringBootAgent');
const { ListDirTool, ReadFileTool, WriteFileTool } = require('../src/tools');
const path = require('path');
const fs = require('fs-extra');

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('JSPToSpringBootAgent', () => {
  let agent;
  let testProjectPath;

  beforeEach(() => {
    agent = new JSPToSpringBootAgent();
    testProjectPath = path.join(__dirname, '../test/_fixtures/blog');
  });

  describe('Tool Management', () => {
    test('should initialize with basic tools', () => {
      const tools = agent.getAvailableTools();
      expect(tools).toContain('list_dir');
      expect(tools).toContain('read_file');
      expect(tools).toContain('write_file');
    });

    test('should be able to use list_dir tool', async () => {
      const result = await agent.useTool('list_dir', {
        dirPath: testProjectPath
      });

      expect(result.success).toBe(true);
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('should handle invalid tool name', async () => {
      await expect(agent.useTool('invalid_tool', {})).rejects.toThrow('Tool not found: invalid_tool');
    });
  });

  describe('Project Analysis', () => {
    test('should analyze project structure', async () => {
      const analysis = await agent.analyzeProject(testProjectPath);

      expect(analysis.success).toBe(true);
      expect(analysis.structure).toBeDefined();
      expect(analysis.jspAnalysis).toBeDefined();
      expect(analysis.servletAnalysis).toBeDefined();
      expect(analysis.conversionPlan).toBeDefined();
    });

    test('should categorize files correctly', async () => {
      const analysis = await agent.analyzeProject(testProjectPath);

      if (analysis.success) {
        expect(analysis.structure.javaFiles.length).toBeGreaterThan(0);
        expect(analysis.structure.configFiles.length).toBeGreaterThan(0);
      }
    });

    test('should handle non-existent project path', async () => {
      const analysis = await agent.analyzeProject('/non/existent/path');

      expect(analysis.success).toBe(false);
      expect(analysis.error).toBeDefined();
    });
  });

  describe('Content Analysis', () => {
    test('should analyze JSP content correctly', () => {
      const jspContent = `
        <%@ page import="java.util.*" %>
        <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <html>
        <body>
          <h1>\${title}</h1>
          <c:forEach var="item" items="\${items}">
            <p>\${item.name}</p>
          </c:forEach>
        </body>
        </html>
      `;

      const analysis = agent._analyzeJSPContent(jspContent);

      expect(analysis.patterns).toContain('jsp_directive');
      expect(analysis.patterns).toContain('el_expression');
      expect(analysis.patterns).toContain('jstl_core');
      expect(analysis.hasJSTL).toBe(true);
      expect(analysis.hasEL).toBe(true);
    });

    test('should analyze Java servlet content correctly', () => {
      const servletContent = `
        @WebServlet(name = "TestServlet", urlPatterns = {"/test"})
        public class TestServlet extends HttpServlet {
          protected void doGet(HttpServletRequest request, HttpServletResponse response) {
            RequestDispatcher dispatcher = request.getRequestDispatcher("/test.jsp");
            dispatcher.forward(request, response);
          }
          
          protected void doPost(HttpServletRequest request, HttpServletResponse response) {
            response.sendRedirect("/success");
          }
        }
      `;

      const analysis = agent._analyzeJavaContent(servletContent, '/path/to/TestServlet.java');

      expect(analysis.isController).toBe(true);
      expect(analysis.patterns).toContain('servlet_annotation');
      expect(analysis.patterns).toContain('http_get');
      expect(analysis.patterns).toContain('http_post');
      expect(analysis.patterns).toContain('request_dispatcher');
      expect(analysis.patterns).toContain('redirect');
    });
  });

  describe('Transformation', () => {
    test('should transform servlet to Spring Boot controller', () => {
      const servletContent = `
        package com.example.controller;
        
        @WebServlet(name = "TestServlet", urlPatterns = {"/test"})
        public class TestServlet extends HttpServlet {
          protected void doGet(HttpServletRequest request, HttpServletResponse response) {
            // implementation
          }
        }
      `;

      const transformed = agent._transformServletToController(servletContent);

      expect(transformed).toContain('@RestController');
      expect(transformed).toContain('@RequestMapping("/api")');
      expect(transformed).toContain('@GetMapping');
      expect(transformed).toContain('import org.springframework.web.bind.annotation');
    });

    test('should transform JSP to Thymeleaf', () => {
      const jspContent = `
        <html>
        <body>
          <h1>\${title}</h1>
          <c:forEach var="item" items="\${items}">
            <p>\${item.name}</p>
          </c:forEach>
        </body>
        </html>
      `;

      const transformed = agent._transformJSPToThymeleaf(jspContent);

      expect(transformed).toContain('xmlns:th="http://www.thymeleaf.org"');
      expect(transformed).toContain('th:text');
      expect(transformed).toContain('th:each');
    });
  });
});

describe('Individual Tools', () => {
  const tempDir = path.join(__dirname, '../temp');

  beforeEach(async () => {
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('ListDirTool', () => {
    test('should list directory contents', async () => {
      const tool = new ListDirTool();

      // Create test files
      await fs.writeFile(path.join(tempDir, 'test.txt'), 'test content');
      await fs.ensureDir(path.join(tempDir, 'subdir'));

      const result = await tool.execute({ dirPath: tempDir });

      expect(result.success).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.some(item => item.name === 'test.txt')).toBe(true);
      expect(result.items.some(item => item.name === 'subdir')).toBe(true);
    });

    test('should handle non-existent directory', async () => {
      const tool = new ListDirTool();
      const result = await tool.execute({ dirPath: '/non/existent' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('ReadFileTool', () => {
    test('should read file content', async () => {
      const tool = new ReadFileTool();
      const testFile = path.join(tempDir, 'test.txt');
      const testContent = 'Hello, World!';

      await fs.writeFile(testFile, testContent);

      const result = await tool.execute({ filePath: testFile });

      expect(result.success).toBe(true);
      expect(result.content).toBe(testContent);
      expect(result.size).toBe(testContent.length);
    });

    test('should handle non-existent file', async () => {
      const tool = new ReadFileTool();
      const result = await tool.execute({ filePath: '/non/existent.txt' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('WriteFileTool', () => {
    test('should write file content', async () => {
      const tool = new WriteFileTool();
      const testFile = path.join(tempDir, 'output.txt');
      const testContent = 'Hello, World!';

      const result = await tool.execute({
        filePath: testFile,
        content: testContent
      });

      expect(result.success).toBe(true);
      expect(result.path).toBe(testFile);

      // Verify file was written
      const written = await fs.readFile(testFile, 'utf8');
      expect(written).toBe(testContent);
    });

    test('should create directories when requested', async () => {
      const tool = new WriteFileTool();
      const testFile = path.join(tempDir, 'nested', 'dir', 'output.txt');
      const testContent = 'Hello, World!';

      const result = await tool.execute({
        filePath: testFile,
        content: testContent,
        createDirs: true
      });

      expect(result.success).toBe(true);
      expect(await fs.pathExists(testFile)).toBe(true);
    });
  });
});
