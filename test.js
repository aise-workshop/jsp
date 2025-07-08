const FileSystemTools = require('./tools');
const JavaFileCopier = require('./java-copier');
const AIAgent = require('./ai-agent');
const path = require('path');

/**
 * Simple test suite for the JSP converter
 */
class TestSuite {
  constructor() {
    this.testResults = [];
    this.sourceDir = path.resolve(__dirname, 'test/_fixtures/blog');
    this.targetDir = path.resolve(__dirname, 'target');
  }

  /**
   * Run a test case
   * @param {string} testName - Name of the test
   * @param {Function} testFunction - Test function
   */
  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running test: ${testName}`);
      await testFunction();
      console.log(`✅ Test passed: ${testName}`);
      this.testResults.push({ name: testName, passed: true });
    } catch (error) {
      console.log(`❌ Test failed: ${testName} - ${error.message}`);
      this.testResults.push({ name: testName, passed: false, error: error.message });
    }
  }

  /**
   * Test FileSystemTools
   */
  async testFileSystemTools() {
    await this.runTest('FileSystemTools.list_dir', () => {
      const items = FileSystemTools.list_dir(this.sourceDir);
      if (items.length === 0) {
        throw new Error('No items found in source directory');
      }
      
      const hasJavaDir = items.some(item => item.name === 'src' && item.isDirectory);
      if (!hasJavaDir) {
        throw new Error('Expected to find src directory');
      }
    });

    await this.runTest('FileSystemTools.read_file', () => {
      const readmePath = path.join(this.sourceDir, 'README.md');
      const content = FileSystemTools.read_file(readmePath);
      if (!content) {
        throw new Error('Failed to read README.md');
      }
      if (!content.includes('Blog')) {
        throw new Error('README.md does not contain expected content');
      }
    });

    await this.runTest('FileSystemTools.write_file and read_file', () => {
      const testPath = '/tmp/test-file.txt';
      const testContent = 'Hello, World!';
      
      const writeSuccess = FileSystemTools.write_file(testPath, testContent);
      if (!writeSuccess) {
        throw new Error('Failed to write test file');
      }
      
      const readContent = FileSystemTools.read_file(testPath);
      if (readContent !== testContent) {
        throw new Error('Read content does not match written content');
      }
    });
  }

  /**
   * Test JavaFileCopier
   */
  async testJavaFileCopier() {
    await this.runTest('JavaFileCopier.getJavaFileStats', () => {
      const copier = new JavaFileCopier(
        `${this.sourceDir}/src/main/java`,
        `${this.targetDir}/src/main/java`
      );
      
      const stats = copier.getJavaFileStats();
      if (stats.totalFiles === 0) {
        throw new Error('No Java files found');
      }
      
      console.log(`  Found ${stats.totalFiles} Java files`);
    });

    await this.runTest('JavaFileCopier.findJavaFiles', () => {
      const copier = new JavaFileCopier(
        `${this.sourceDir}/src/main/java`,
        `${this.targetDir}/src/main/java`
      );
      
      const javaFiles = copier.findJavaFiles(`${this.sourceDir}/src/main/java`);
      if (javaFiles.length === 0) {
        throw new Error('No Java files found');
      }
      
      const hasJavaExtension = javaFiles.every(file => file.endsWith('.java'));
      if (!hasJavaExtension) {
        throw new Error('Non-Java files found in Java file list');
      }
    });
  }

  /**
   * Test AIAgent
   */
  async testAIAgent() {
    await this.runTest('AIAgent.analyzeProject', () => {
      const agent = new AIAgent();
      const analysis = agent.analyzeProject(this.sourceDir, this.targetDir);
      
      if (analysis.javaFiles.length === 0) {
        throw new Error('No Java files found in analysis');
      }
      
      if (analysis.jspFiles.length === 0) {
        throw new Error('No JSP files found in analysis');
      }
      
      if (analysis.conversionPlan.length === 0) {
        throw new Error('No conversion plan generated');
      }
      
      console.log(`  Analysis found: ${analysis.javaFiles.length} Java files, ${analysis.jspFiles.length} JSP files`);
      console.log(`  Conversion plan has ${analysis.conversionPlan.length} steps`);
    });

    await this.runTest('AIAgent.findFilesByExtension', () => {
      const agent = new AIAgent();
      const javaFiles = agent.findFilesByExtension(`${this.sourceDir}/src/main/java`, '.java');
      
      if (javaFiles.length === 0) {
        throw new Error('No Java files found');
      }
      
      const allJavaFiles = javaFiles.every(file => file.endsWith('.java'));
      if (!allJavaFiles) {
        throw new Error('Non-Java files found');
      }
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting JSP Converter Test Suite');
    console.log('=====================================');
    
    await this.testFileSystemTools();
    await this.testJavaFileCopier();
    await this.testAIAgent();
    
    console.log('\\n📊 Test Results:');
    console.log('=================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }
    
    console.log('\\n🎉 Test suite completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new TestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = TestSuite;