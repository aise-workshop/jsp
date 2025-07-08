# jsp

我正在使用 JavaScript 实现一个 Java + JSP 转 Java + Spring Boot 的 CLI 工具。

1. `test/_fixtures` 是我用来测试的 JSP 项目
2. `target` 目录是 Spring Boot 的工程

现在我，需要你实现如下的功能：

1. 实现基本的 Java 文件复制
2. 设计一个 AI Agent。
   - 参考你（GitHub Copilot）的工具设计，创建几个基本的 Tool 来转换 JSP 工具
       - `list_dir`
       - `read_file`
       - `write_file`
   - AI Agent 第一步根据需求来调用工具，决定转换某些文件，或者修改哪个文件
   - 执行对应的工具


你先帮我实现基本的轮库。

