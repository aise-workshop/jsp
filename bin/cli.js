#!/usr/bin/env node

const { program } = require('commander');
const JSPConverter = require('../src/index.js');

program
  .name('jsp-convert')
  .description('CLI tool to convert JSP projects to Spring Boot')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a JSP project to Spring Boot')
  .option('-s, --source <path>', 'Source JSP project path')
  .option('-t, --target <path>', 'Target Spring Boot project path')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (options) => {
    const converter = new JSPConverter(options);
    await converter.convert();
  });

program.parse();