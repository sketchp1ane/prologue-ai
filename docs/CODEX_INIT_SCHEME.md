# Prologue Codex Agent 初始化配置方案

这份方案面向“用 Codex Agent 完成全流程开发”的工作方式。

核心目标：

1. 让 Codex 先读懂项目，而不是边写边猜。
2. 用 docs 作为单一事实源。
3. 用 AGENTS.md 固化仓库级规则。
4. 用 .codex/config.toml 固化模型、权限、MCP、skills、subagents。
5. 用小型 skills 让 OpenAI API、垂直切片、Prisma 数据建模流程稳定复用。
6. 用 `pnpm check` 形成每轮交付验收闭环。

## Authenticated browser QA

Codex 在本地浏览器里验证受保护页面时，优先使用项目内置的 Clerk
一次性登录链接流程：

```bash
pnpm dev:clerk-login -- --next=/applications
```

约定：

- `.env.local` 应配置 `CLERK_SECRET_KEY` 和 `CLERK_TEST_USER_ID`。
- 脚本会调用 Clerk Backend API 创建短期 sign-in token，并打印
  `/dev/clerk-ticket?...` URL。
- Codex 可以把该 URL 打开到 in-app browser 完成真实 Clerk session 登录。
- 不要把 token 写入聊天总结、日志、文档、git diff 或提交记录。
- 如果 `CLERK_TEST_USER_ID` 暂缺，而用户明确要求完成登录 QA，Codex 可以只读查询本地
  `Application.userId` 或 `Resume.userId` 临时生成 token；该 fallback 不能写入
  `.env.local` 或仓库文件。

建议把 zip 包内容复制到仓库根目录，然后从 `docs/05_CODEX_TASKS.md` 的 T00 开始执行。
