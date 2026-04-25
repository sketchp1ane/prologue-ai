# Prologue Codex Agent 初始化配置方案

这份方案面向“用 Codex Agent 完成全流程开发”的工作方式。

核心目标：

1. 让 Codex 先读懂项目，而不是边写边猜。
2. 用 docs 作为单一事实源。
3. 用 AGENTS.md 固化仓库级规则。
4. 用 .codex/config.toml 固化模型、权限、MCP、skills、subagents。
5. 用小型 skills 让 OpenAI API、垂直切片、Prisma 数据建模流程稳定复用。
6. 用 `pnpm check` 形成每轮交付验收闭环。

建议把 zip 包内容复制到仓库根目录，然后从 `docs/05_CODEX_TASKS.md` 的 T00 开始执行。
