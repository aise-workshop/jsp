#!/usr/bin/env node

/**
 * Demo script to show JSP to Spring Boot conversion
 */

const path = require('path');
const JSPConverter = require('../src/index.js');

async function runDemo() {
  console.log('🚀 JSP to Spring Boot Conversion Demo');
  console.log('=====================================\n');

  // Create a new converter instance
  const converter = new JSPConverter({
    source: path.join(__dirname, '../test/_fixtures/blog'),
    target: path.join(__dirname, '../tmp/demo-output'),
    verbose: true
  });

  // Run the conversion
  await converter.convert();

  console.log('\n📁 Generated Files:');
  const fs = require('fs-extra');
  const outputDir = path.join(__dirname, '../tmp/demo-output');
  
  // Show converted templates
  const templatesDir = path.join(outputDir, 'src/main/resources/templates');
  if (await fs.pathExists(templatesDir)) {
    const templates = await fs.readdir(templatesDir);
    console.log('  Templates (JSP → Thymeleaf):');
    templates.forEach(template => console.log(`    - ${template}`));
  }
  
  // Show static resources
  const staticDir = path.join(outputDir, 'src/main/resources/static');
  if (await fs.pathExists(staticDir)) {
    const walkDir = async (dir, prefix = '') => {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          console.log(`    - ${prefix}${item}/`);
          await walkDir(itemPath, prefix + '  ');
        } else {
          console.log(`    - ${prefix}${item}`);
        }
      }
    };
    console.log('  Static Resources:');
    await walkDir(staticDir);
  }
  
  console.log('\n✅ Conversion completed successfully!');
  console.log(`📂 Output directory: ${outputDir}`);
}

// Run the demo
runDemo().catch(console.error);