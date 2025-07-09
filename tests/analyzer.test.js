/**
 * Tests for the Business Logic Analyzer
 */

const BusinessLogicAnalyzer = require('../src/analyzers/BusinessLogicAnalyzer');
const path = require('path');

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('BusinessLogicAnalyzer', () => {
  let analyzer;
  let testProjectPath;

  beforeEach(() => {
    analyzer = new BusinessLogicAnalyzer();
    testProjectPath = path.join(__dirname, '../test/_fixtures/blog');
  });

  describe('Logic Pattern Analysis', () => {
    test('should analyze servlet patterns', async () => {
      const patterns = await analyzer._analyzeServletPatterns(testProjectPath);

      expect(patterns).toBeDefined();
      expect(typeof patterns.strategyPattern).toBe('boolean');
      expect(typeof patterns.daoPattern).toBe('boolean');
      expect(typeof patterns.mvcPattern).toBe('boolean');
    });

    test('should detect strategy pattern in blog project', async () => {
      const patterns = await analyzer._analyzeServletPatterns(testProjectPath);

      // The blog project should have strategy pattern
      expect(patterns.strategyPattern).toBe(true);
    });

    test('should analyze JSP patterns', async () => {
      const patterns = await analyzer._analyzeJSPPatterns(testProjectPath);

      expect(patterns).toBeDefined();
      expect(typeof patterns.jstlUsage).toBe('boolean');
      expect(typeof patterns.elExpressions).toBe('boolean');
      expect(typeof patterns.customTags).toBe('boolean');
    });

    test('should analyze complete business logic', async () => {
      const analysis = await analyzer.analyzeLogicPatterns(testProjectPath);

      expect(analysis).toBeDefined();
      expect(analysis.timestamp).toBeDefined();
      expect(analysis.projectPath).toBe(testProjectPath);
      expect(analysis.servletPatterns).toBeDefined();
      expect(analysis.jspPatterns).toBeDefined();
      expect(analysis.dataFlow).toBeDefined();
      expect(analysis.securityPatterns).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe('Screenshot Functionality', () => {
    test('should capture mock screenshots', async () => {
      const result = await analyzer.captureApplicationScreenshots('http://localhost:8080');

      expect(result.success).toBe(true);
      expect(result.screenshots).toBeDefined();
      expect(Array.isArray(result.screenshots)).toBe(true);
      expect(result.baseUrl).toBe('http://localhost:8080');
      expect(result.timestamp).toBeDefined();
    });

    test('should capture screenshots for custom endpoints', async () => {
      const endpoints = ['/custom1', '/custom2'];
      const result = await analyzer.captureApplicationScreenshots(
        'http://localhost:8080',
        endpoints,
        { usePuppeteer: false } // 保证测试走 mock 路径，避免依赖 Puppeteer
      );

      expect(result.success).toBe(true);
      expect(result.screenshots.length).toBe(endpoints.length);

      result.screenshots.forEach((screenshot, index) => {
        expect(screenshot.endpoint).toBe(endpoints[index]);
        expect(screenshot.url).toBe(`http://localhost:8080${endpoints[index]}`);
        expect(screenshot.mock).toBe(true);
      });
    });
  });

  describe('Data Flow Analysis', () => {
    test('should analyze request and response flow', async () => {
      const dataFlow = await analyzer._analyzeDataFlow(testProjectPath);

      expect(dataFlow).toBeDefined();
      expect(Array.isArray(dataFlow.requestFlow)).toBe(true);
      expect(Array.isArray(dataFlow.responseFlow)).toBe(true);
      expect(Array.isArray(dataFlow.dataBinding)).toBe(true);
      expect(Array.isArray(dataFlow.validationPoints)).toBe(true);
      expect(Array.isArray(dataFlow.transactionBoundaries)).toBe(true);
    });
  });

  describe('Security Analysis', () => {
    test('should analyze security patterns', async () => {
      const security = await analyzer._analyzeSecurityPatterns(testProjectPath);

      expect(security).toBeDefined();
      expect(Array.isArray(security.authenticationMechanisms)).toBe(true);
      expect(Array.isArray(security.authorizationChecks)).toBe(true);
      expect(Array.isArray(security.inputValidation)).toBe(true);
      expect(typeof security.sqlInjectionProtection).toBe('boolean');
      expect(typeof security.xssProtection).toBe('boolean');
      expect(typeof security.csrfProtection).toBe('boolean');
      expect(Array.isArray(security.sessionSecurity)).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    test('should find files by pattern', async () => {
      const javaFiles = await analyzer._findFiles(testProjectPath, '*.java');

      expect(Array.isArray(javaFiles)).toBe(true);
      expect(javaFiles.length).toBeGreaterThan(0);

      javaFiles.forEach(file => {
        expect(file.endsWith('.java')).toBe(true);
      });
    });

    test('should extract methods from content', () => {
      const content = `
        public class TestClass {
          public void doGet(HttpServletRequest request) {
            // implementation
          }
          
          protected void doPost(HttpServletRequest request) {
            // implementation
          }
        }
      `;

      const methods = analyzer._extractMethods(content, ['doGet', 'doPost']);

      expect(Array.isArray(methods)).toBe(true);
      expect(methods.length).toBe(2);
    });

    test('should extract redirects from content', () => {
      const content = `
        response.sendRedirect("/posts");
        dispatcher.forward("/posts.jsp");
      `;

      const redirects = analyzer._extractRedirects(content);

      expect(Array.isArray(redirects)).toBe(true);
      expect(redirects.length).toBeGreaterThan(0);
    });
  });

  describe('Report Generation', () => {
    test('should generate analysis summary', () => {
      // Add some mock analysis results
      analyzer.analysisResults.push({
        projectPath: '/test/project',
        timestamp: new Date().toISOString(),
        recommendations: [
          { title: 'Test recommendation 1' },
          { title: 'Test recommendation 2' }
        ]
      });

      const summary = analyzer._generateSummary();

      expect(summary).toBeDefined();
      expect(summary.totalProjects).toBe(1);
      expect(summary.latestAnalysis).toBeDefined();
      expect(summary.latestAnalysis.recommendationCount).toBe(2);
    });

    test('should handle empty analysis results', () => {
      const summary = analyzer._generateSummary();

      expect(summary).toBeDefined();
      expect(summary.message).toBe('No analyses performed yet');
    });
  });

  describe('Recommendations', () => {
    test('should generate relevant recommendations', () => {
      const mockAnalysis = {
        servletPatterns: {
          strategyPattern: true,
          daoPattern: true
        },
        jspPatterns: {
          jstlUsage: true,
          elExpressions: true
        },
        securityPatterns: {
          csrfProtection: false,
          sqlInjectionProtection: true
        }
      };

      const recommendations = analyzer._generateRecommendations(mockAnalysis);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Should recommend converting strategy pattern
      const strategyRec = recommendations.find(r => r.title.includes('Strategy Pattern'));
      expect(strategyRec).toBeDefined();

      // Should recommend JSTL to Thymeleaf migration
      const jstlRec = recommendations.find(r => r.title.includes('JSTL to Thymeleaf'));
      expect(jstlRec).toBeDefined();

      // Should recommend CSRF protection
      const csrfRec = recommendations.find(r => r.title.includes('CSRF Protection'));
      expect(csrfRec).toBeDefined();
    });
  });
});
