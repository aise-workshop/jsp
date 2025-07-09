/**
 * Spring Boot Configuration Generator
 * Generates Spring Boot configuration files and dependencies
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class SpringBootConfigGenerator {
  constructor() {
    this.defaultDependencies = [
      'spring-boot-starter-web',
      'spring-boot-starter-thymeleaf',
      'spring-boot-starter-data-jpa',
      'spring-boot-starter-validation',
      'spring-boot-starter-security',
      'spring-boot-devtools',
      'h2',
      'postgresql',
      'spring-boot-starter-test'
    ];
  }

  async generateConfiguration(projectAnalysis, targetPath, options = {}) {
    try {
      logger.info(`Generating Spring Boot configuration in: ${targetPath}`);

      const results = {
        applicationYml: null,
        pomXml: null,
        mainClass: null,
        securityConfig: null
      };

      // Generate application.yml
      results.applicationYml = await this._generateApplicationYml(projectAnalysis, targetPath, options);

      // Generate or update pom.xml
      results.pomXml = await this._generatePomXml(projectAnalysis, targetPath, options);

      // Generate main application class
      results.mainClass = await this._generateMainClass(projectAnalysis, targetPath, options);

      // Generate security configuration if needed
      if (this._needsSecurityConfig(projectAnalysis)) {
        results.securityConfig = await this._generateSecurityConfig(projectAnalysis, targetPath, options);
      }

      return {
        success: true,
        results
      };

    } catch (error) {
      logger.error(`Error generating Spring Boot configuration: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async _generateApplicationYml(projectAnalysis, targetPath, options) {
    const config = {
      server: {
        port: options.serverPort || 8080,
        servlet: {
          'context-path': options.contextPath || ''
        }
      },
      spring: {
        application: {
          name: options.applicationName || 'jsp-converted-app'
        },
        datasource: {
          url: options.databaseUrl || 'jdbc:h2:mem:testdb',
          username: options.databaseUsername || 'sa',
          password: options.databasePassword || '',
          'driver-class-name': options.databaseDriver || 'org.h2.Driver'
        },
        jpa: {
          'hibernate': {
            'ddl-auto': options.ddlAuto || 'create-drop'
          },
          'show-sql': options.showSql || true,
          'database-platform': options.databasePlatform || 'org.hibernate.dialect.H2Dialect'
        },
        thymeleaf: {
          cache: false,
          prefix: 'classpath:/templates/',
          suffix: '.html'
        }
      },
      logging: {
        level: {
          com: {
            [options.basePackage || 'example']: options.logLevel || 'DEBUG'
          },
          org: {
            springframework: {
              web: 'DEBUG'
            }
          }
        }
      }
    };

    // Add security configuration if needed
    if (this._hasSecurityFeatures(projectAnalysis)) {
      config.spring.security = {
        user: {
          name: 'admin',
          password: 'admin',
          roles: ['ADMIN']
        }
      };
    }

    const yamlContent = this._objectToYaml(config);
    const configPath = path.join(targetPath, 'src', 'main', 'resources', 'application.yml');

    await fs.ensureDir(path.dirname(configPath));
    await fs.writeFile(configPath, yamlContent, 'utf8');

    return {
      success: true,
      path: configPath,
      content: yamlContent
    };
  }

  async _generatePomXml(projectAnalysis, targetPath, options) {
    const groupId = options.groupId || 'com.example';
    const artifactId = options.artifactId || 'jsp-converted-app';
    const version = options.version || '1.0.0';
    const javaVersion = options.javaVersion || '17';

    const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${version}</version>
    <packaging>jar</packaging>

    <name>${artifactId}</name>
    <description>Converted JSP application to Spring Boot</description>

    <properties>
        <java.version>${javaVersion}</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        ${this._hasSecurityFeatures(projectAnalysis) ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>` : ''}

        <!-- Database -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Development Tools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;

    const pomPath = path.join(targetPath, 'pom.xml');
    await fs.writeFile(pomPath, pomContent, 'utf8');

    return {
      success: true,
      path: pomPath,
      content: pomContent
    };
  }

  async _generateMainClass(projectAnalysis, targetPath, options) {
    const packageName = options.basePackage || 'com.example.app';
    const className = options.mainClassName || 'Application';

    const mainClassContent = `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {
    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}`;

    const packagePath = packageName.replace(/\./g, '/');
    const mainClassPath = path.join(targetPath, 'src', 'main', 'java', packagePath, `${className}.java`);

    await fs.ensureDir(path.dirname(mainClassPath));
    await fs.writeFile(mainClassPath, mainClassContent, 'utf8');

    return {
      success: true,
      path: mainClassPath,
      content: mainClassContent
    };
  }

  async _generateSecurityConfig(projectAnalysis, targetPath, options) {
    const packageName = options.basePackage || 'com.example.app';
    const className = 'SecurityConfig';

    const securityConfigContent = `package ${packageName}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class ${className} {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/home", "/css/**", "/js/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.builder()
            .username("admin")
            .password(passwordEncoder().encode("admin"))
            .roles("ADMIN")
            .build();

        return new InMemoryUserDetailsManager(user);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`;

    const packagePath = packageName.replace(/\./g, '/');
    const securityConfigPath = path.join(targetPath, 'src', 'main', 'java', packagePath, 'config', `${className}.java`);

    await fs.ensureDir(path.dirname(securityConfigPath));
    await fs.writeFile(securityConfigPath, securityConfigContent, 'utf8');

    return {
      success: true,
      path: securityConfigPath,
      content: securityConfigContent
    };
  }

  _needsSecurityConfig(projectAnalysis) {
    return this._hasSecurityFeatures(projectAnalysis);
  }

  _hasSecurityFeatures(projectAnalysis) {
    // Check if the project has security-related patterns
    if (projectAnalysis.logicAnalysis && projectAnalysis.logicAnalysis.securityPatterns) {
      const security = projectAnalysis.logicAnalysis.securityPatterns;
      return security.authenticationMechanisms.length > 0 ||
             security.authorizationChecks.length > 0 ||
             security.sessionSecurity.length > 0;
    }
    return false;
  }

  _objectToYaml(obj, indent = 0) {
    let yaml = '';
    const spaces = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this._objectToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          yaml += `${spaces}  - ${item}\n`;
        }
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }
}

module.exports = SpringBootConfigGenerator;
