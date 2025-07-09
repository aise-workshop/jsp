/**
 * JSP to Thymeleaf Transformer
 * Converts JSP files to Thymeleaf templates
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class JSPToThymeleafTransformer {
  constructor() {
    this.jstlToThymeleafMap = {
      // Core JSTL tags
      '<c:out value="${': '<span th:text="${',
      '<c:if test="${': '<div th:if="${',
      '<c:choose>': '<!-- th:switch -->',
      '<c:when test="${': '<div th:case="${',
      '<c:otherwise>': '<div th:case="*">',
      '<c:forEach var="': '<div th:each="',
      '<c:forTokens': '<div th:each="',
      '<c:import url="': '<div th:include="',
      '<c:redirect url="': '<meta th:attr="http-equiv=\'refresh\', content=\'0; url=\' + ${',

      // Format JSTL tags
      '<fmt:message key="': '<span th:text="#{',
      '<fmt:formatDate value="${': '<span th:text="${#dates.format(',
      '<fmt:formatNumber value="${': '<span th:text="${#numbers.formatDecimal(',

      // SQL JSTL tags (should be replaced with Spring Data)
      '<sql:query': '<!-- Replace with Spring Data Repository -->',
      '<sql:update': '<!-- Replace with Spring Data Repository -->',

      // Custom tags
      '<%@': '<!-- JSP directive - review manually -->'
    };
  }

  async transformJSPFile(jspFilePath, outputPath) {
    try {
      logger.info(`Transforming JSP file: ${jspFilePath} -> ${outputPath}`);

      const jspContent = await fs.readFile(jspFilePath, 'utf8');
      const thymeleafContent = this._transformContent(jspContent);

      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, thymeleafContent, 'utf8');

      return {
        success: true,
        source: jspFilePath,
        target: outputPath,
        transformations: this._getTransformationSummary(jspContent, thymeleafContent)
      };

    } catch (error) {
      logger.error(`Error transforming JSP file: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  _transformContent(jspContent) {
    let content = jspContent;

    // Add Thymeleaf namespace to HTML tag
    content = this._addThymeleafNamespace(content);

    // Transform JSP directives
    content = this._transformDirectives(content);

    // Transform JSTL tags FIRST (before EL expressions)
    content = this._transformJSTLTags(content);

    // Transform JSP includes and forwards
    content = this._transformIncludes(content);

    // Transform form elements
    content = this._transformForms(content);

    // Transform remaining EL expressions LAST
    content = this._transformELExpressions(content);

    // Clean up and format
    content = this._cleanupContent(content);

    return content;
  }

  _addThymeleafNamespace(content) {
    // Add Thymeleaf namespace to html tag
    if (content.includes('<html')) {
      content = content.replace(
        /<html([^>]*)>/i,
        '<html$1 xmlns:th="http://www.thymeleaf.org">'
      );
    } else {
      // If no html tag, add it
      content = '<!DOCTYPE html>\n<html xmlns:th="http://www.thymeleaf.org">\n' + content + '\n</html>';
    }

    return content;
  }

  _transformDirectives(content) {
    // Transform page directives
    content = content.replace(
      /<%@\s*page\s+([^%>]+)%>/g,
      '<!-- JSP Page Directive: $1 -->'
    );

    // Transform taglib directives
    content = content.replace(
      /<%@\s*taglib\s+([^%>]+)%>/g,
      '<!-- JSP Taglib Directive: $1 -->'
    );

    return content;
  }

  _transformJSTLTags(content) {
    // Transform c:forEach first (more complex pattern)
    content = content.replace(
      /<c:forEach\s+items="\$\{([^}]+)\}"\s+var="([^"]+)"[^>]*>/g,
      '<div th:each="$2 : ${$1}">'
    );
    content = content.replace(
      /<c:forEach\s+var="([^"]+)"\s+items="\$\{([^}]+)\}"[^>]*>/g,
      '<div th:each="$1 : ${$2}">'
    );
    content = content.replace(/<\/c:forEach>/g, '</div>');

    // Transform c:out
    content = content.replace(
      /<c:out\s+value="\$\{([^}]+)\}"[^>]*\/>/g,
      '<span th:text="${$1}"></span>'
    );

    // Transform c:if
    content = content.replace(
      /<c:if\s+test="\$\{([^}]+)\}"[^>]*>/g,
      '<div th:if="${$1}">'
    );
    content = content.replace(/<\/c:if>/g, '</div>');

    // Transform c:choose/c:when/c:otherwise
    content = content.replace(/<c:choose>/g, '<div>');
    content = content.replace(
      /<c:when\s+test="\$\{([^}]+)\}"[^>]*>/g,
      '<div th:if="${$1}">'
    );
    content = content.replace(/<\/c:when>/g, '</div>');
    content = content.replace(/<c:otherwise>/g, '<div th:unless="${true}">');
    content = content.replace(/<\/c:otherwise>/g, '</div>');
    content = content.replace(/<\/c:choose>/g, '</div>');

    return content;
  }

  _transformELExpressions(content) {
    // Transform EL expressions that are standalone (not in attributes)
    // Split content into lines for better processing
    const lines = content.split('\n');
    const transformedLines = lines.map(line => {
      // Skip lines that already contain Thymeleaf attributes
      if (line.includes('th:')) {
        return line;
      }

      // Transform standalone EL expressions
      return line.replace(/\$\{([^}]+)\}/g, '<span th:text="${$1}"></span>');
    });

    return transformedLines.join('\n');
  }

  _transformIncludes(content) {
    // Transform JSP includes
    content = content.replace(
      /<jsp:include\s+page="([^"]+)"[^>]*\/>/g,
      '<div th:include="$1"></div>'
    );

    // Transform JSP forwards
    content = content.replace(
      /<jsp:forward\s+page="([^"]+)"[^>]*\/>/g,
      '<!-- JSP Forward to $1 - Handle in controller -->'
    );

    return content;
  }

  _transformForms(content) {
    // Transform form elements to use Thymeleaf
    content = content.replace(
      /<form([^>]*)>/g,
      '<form$1 th:action="@{/}" method="post">'
    );

    // Transform input elements
    content = content.replace(
      /<input([^>]*)\s+name="([^"]+)"([^>]*)>/g,
      '<input$1 name="$2" th:field="*{$2}"$3>'
    );

    return content;
  }

  _cleanupContent(content) {
    // Remove empty lines and fix indentation
    content = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    // Add proper indentation
    const lines = content.split('\n');
    let indentLevel = 0;
    const indentedLines = [];

    for (const line of lines) {
      if (line.includes('</') && !line.includes('</'+ line.split('</')[1].split('>')[0] + '>')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      indentedLines.push('  '.repeat(indentLevel) + line);

      if (line.includes('<') && !line.includes('</') && !line.includes('/>') && !line.includes('<!--')) {
        indentLevel++;
      }
    }

    return indentedLines.join('\n');
  }

  _getTransformationSummary(originalContent, _transformedContent) {
    const summary = {
      jstlTagsTransformed: 0,
      elExpressionsFound: 0,
      directivesRemoved: 0,
      formsTransformed: 0
    };

    // Count JSTL tags
    const jstlMatches = originalContent.match(/<c:|<fmt:|<sql:/g);
    summary.jstlTagsTransformed = jstlMatches ? jstlMatches.length : 0;

    // Count EL expressions
    const elMatches = originalContent.match(/\$\{[^}]+\}/g);
    summary.elExpressionsFound = elMatches ? elMatches.length : 0;

    // Count directives
    const directiveMatches = originalContent.match(/<%@[^%>]+%>/g);
    summary.directivesRemoved = directiveMatches ? directiveMatches.length : 0;

    // Count forms
    const formMatches = originalContent.match(/<form[^>]*>/g);
    summary.formsTransformed = formMatches ? formMatches.length : 0;

    return summary;
  }

  async transformMultipleFiles(jspFiles, outputDir) {
    const results = [];

    for (const jspFile of jspFiles) {
      const relativePath = path.relative(path.dirname(jspFile), jspFile);
      const outputFile = path.join(outputDir, relativePath.replace('.jsp', '.html'));

      const result = await this.transformJSPFile(jspFile, outputFile);
      results.push(result);
    }

    return {
      success: true,
      totalFiles: jspFiles.length,
      successfulTransformations: results.filter(r => r.success).length,
      failedTransformations: results.filter(r => !r.success).length,
      results
    };
  }
}

module.exports = JSPToThymeleafTransformer;
