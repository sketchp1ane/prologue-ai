# 《第一页 / Prologue》三周开发计划 — Codex + OpenAI API 优化版

> 版本：v2.0  
> 日期：2026-04-24  
> 目标：用 21 天完成一个可上线、可演示、可真实使用的 AI 求职工作台  
> 范围：只关注项目开发、OpenAI API 集成、工程交付与上线，不包含算法刷题、面试准备、求职投递策略等非项目内容

---

## 0. 最终交付物

三周结束时，需要交付以下内容：

1. 一个线上可访问的产品：`第一页 / Prologue`。
2. 一个公开或可展示的 GitHub 仓库。
3. 完整主流程：登录 → 上传简历 → AI 解析 → 新建投递 → 看板管理 → JD 诊断 → bullet 重写 → 话术生成 → 面试复盘 / 周报洞察。
4. OpenAI API 能力稳定接入：Responses API、Structured Outputs、File Inputs、Streaming、Moderation / 安全检查、成本日志。
5. 一套 Codex 友好的工程文档：`AGENTS.md`、`docs/CODEX_TASKS.md`、`docs/AI_SCHEMAS.md`、`docs/DEVLOG.md`。
6. README 展示完整：产品定位、截图、技术架构、本地运行、环境变量、核心 AI 能力说明。
7. 生产环境核心流程通过 smoke test。

---

## 1. 计划设计原则

### 1.1 项目优先，不做非必要系统

三周内的目标不是做一个“功能很多”的系统，而是做一个“主流程完整、AI 能力清楚、工程结构干净”的作品。

不进入本计划的内容：

- 独立后端服务。
- LangChain / Crew / AutoGPT 式复杂 agent 编排。
- 支付、订阅、积分系统。
- 招聘方后台。
- 浏览器插件。
- 复杂简历编辑器。
- 完整移动端 App。
- 大规模 RAG 知识库。

### 1.2 Codex 友好优先

所有任务都要尽量拆成 Codex 擅长完成的小块：

- 先写 schema，再写服务，再写 UI。
- 每天任务都有明确输入、输出、验收标准。
- 每次让 Codex 修改的文件范围尽量小。
- 每个 AI 功能都配 fixture 和 schema 测试。
- 所有重复规则写入 `AGENTS.md`，避免每次重新解释。

### 1.3 OpenAI API 适配优先

AI 能力统一走 OpenAI 生态：

- 简历 PDF 解析：Responses API + `input_file`。
- JD 抽取：Responses API + Structured Outputs。
- 诊断报告：Responses API + Structured Outputs。
- bullet 重写：Responses API + Streaming。
- 话术生成：Responses API + Structured Outputs。
- 面试复盘：Responses API + Structured Outputs。
- 周报洞察：Responses API + Structured Outputs。
- 输入安全：Moderation + 本地规则 + 长度限制。

### 1.4 先闭环，再打磨

功能优先级：

1. 能跑通主流程。
2. 能保存和恢复数据。
3. AI 输出稳定可解析。
4. UI 能清楚展示结果。
5. 最后才做动效、拖拽、响应式、README 包装。

---

## 2. 推荐技术栈

| 层级 | 推荐选型 | 原因 |
|---|---|---|
| 应用框架 | Next.js App Router | 前后端一体，Codex 熟悉度高，部署路径短 |
| 语言 | TypeScript strict | 类型约束明确，便于 Codex 重构和修复 |
| UI | Tailwind CSS + shadcn/ui + Radix UI | 快速产出一致 UI，组件结构清晰 |
| 图标 | lucide-react | 简单、轻量、常见 |
| 表单 | React Hook Form + Zod | 表单校验和 AI schema 思路一致 |
| 数据库 | Postgres + Prisma | `schema.prisma` 是 Codex 易读的强约束源 |
| 数据库托管 | Neon / Prisma Postgres / Supabase Postgres 三选一 | 选择你最快能跑通的 Postgres 托管即可 |
| 认证 | Clerk | 快速接入登录和受保护路由 |
| 文件存储 | Vercel Blob | 和 Vercel / Next.js 链路贴合 |
| AI SDK | OpenAI TypeScript SDK | 直接适配 OpenAI API |
| 图表 | Recharts | 适合诊断报告和周报 |
| 拖拽 | dnd-kit，可降级 | 拖拽是加分项，不阻塞主流程 |
| 测试 | Vitest + Playwright smoke test | 单测覆盖 schema / service，端到端只测主流程 |
| 部署 | Vercel | Next.js 最短上线路径 |

### 2.1 建议模型路由

模型不要硬编码，全部通过环境变量配置：

```bash
OPENAI_MODEL_SMALL=gpt-5.4-nano
OPENAI_MODEL_MEDIUM=gpt-5.4-mini
OPENAI_MODEL_LARGE=gpt-5.4
```

建议路由：

| 功能 | 默认模型 | 理由 |
|---|---|---|
| JD 抽取 | SMALL | 简单结构化抽取，成本优先 |
| 简历解析 | MEDIUM | PDF 信息复杂度中等 |
| 诊断报告 | LARGE | 核心招牌功能，质量优先 |
| bullet 重写 | MEDIUM | 需要稳定表达和流式体验 |
| 打招呼话术 | SMALL / MEDIUM | 文本短，成本优先 |
| 面试复盘 | MEDIUM | 需要一定推理和建议质量 |
| 周报洞察 | MEDIUM | 数据汇总 + 建议生成 |

---

## 3. 推荐项目结构

```txt
prologue/
  app/
    (marketing)/
      page.tsx
    (app)/
      dashboard/
      resumes/
      applications/[id]/
      settings/
    api/
      resumes/upload/
      resumes/[id]/parse/
      applications/
      applications/[id]/diagnose/
      applications/[id]/greeting/
      applications/[id]/interview-review/
      ai/rewrite-bullet/
  components/
    ui/
    layout/
    resumes/
    applications/
    ai/
  src/
    lib/
      ai/
        client.ts
        models.ts
        prompts/
        schemas/
        services/
        safety.ts
        usage.ts
      db/
        prisma.ts
        ownership.ts
      auth/
      validators/
      utils/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  tests/
    ai/
    services/
    e2e/
  docs/
    CODEX_TASKS.md
    AI_SCHEMAS.md
    DEVLOG.md
    RELEASE_CHECKLIST.md
  AGENTS.md
  README.md
```

### 3.1 每日固定命令

每天结束前至少跑：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma generate
```

Week 2 之后加：

```bash
pnpm test:e2e
```

建议在 `package.json` 中统一成：

```bash
pnpm check
```

---

## 4. 每天工作节奏

假设每天投入 6-8 小时：

| 时段 | 时间 | 任务 |
|---|---:|---|
| 上午 | 3-4h | 用 Codex 完成当天核心实现 |
| 下午 | 2-3h | 手动集成、调试、跑测试、修边界问题 |
| 晚上 | 0.5-1h | 更新 `docs/DEVLOG.md`、提交代码、整理明日 Codex prompt |

每天结束必须完成三件事：

1. 有一个可提交的 commit。
2. `pnpm check` 尽量通过；若未通过，必须在 DEVLOG 标注原因。
3. 明确第二天的第一条 Codex prompt。

---

# Week 1：地基 + 数据闭环

## Week 1 目标

到 Day 7 结束，产品必须做到：

- 能登录。
- 能上传 PDF 简历。
- 能创建 Resume 记录。
- 能调用 OpenAI 解析简历。
- 能新建投递并抽取 JD 信息。
- 能在 dashboard 看板看到投递记录。
- 能更新投递状态。
- 有第一次 Vercel 预览部署。

Week 1 的核心不是 UI 惊艳，而是把“用户数据 + 简历 + 投递 + AI 解析”跑通。

---

## Day 1：项目初始化 + Codex 工作环境

### 目标

建立一个 Codex 能长期稳定协作的 Next.js 项目骨架。

### 上午：初始化项目

任务：

- 创建 Next.js App Router 项目。
- 启用 TypeScript strict。
- 安装 Tailwind、shadcn/ui、lucide-react。
- 初始化 Git 仓库。
- 创建基础路由：
  - `/`
  - `/dashboard`
  - `/resumes`
  - `/settings`
- 创建基础 layout：顶部导航、侧边栏、主内容区。

建议命令：

```bash
npx create-next-app@latest prologue
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input card dialog badge dropdown-menu textarea tabs skeleton toast
```

### 下午：Codex 协作文件

创建：

- `AGENTS.md`
- `docs/CODEX_TASKS.md`
- `docs/DEVLOG.md`
- `docs/AI_SCHEMAS.md`
- `docs/RELEASE_CHECKLIST.md`
- `README.md` 初版

`AGENTS.md` 至少包含：

- 技术栈。
- 目录结构。
- 代码风格。
- 不要引入 LangChain。
- 不要自建 Express 后端。
- OpenAI 调用只写在 `src/lib/ai`。
- 数据库访问只写在 `src/lib/db` 或 server actions。
- 每次修改后运行 `pnpm check`。

### Codex prompt 示例

```txt
请根据当前仓库生成 AGENTS.md、docs/CODEX_TASKS.md 和 docs/DEVLOG.md。
项目目标是三周内完成一个 AI 求职工作台。
请在 AGENTS.md 中明确：Next.js App Router、TypeScript strict、Prisma、Clerk、Vercel Blob、OpenAI Responses API、Zod schema-first。
不要实现业务功能，只生成文档和基础目录结构。
```

### 验收标准

- 项目可以本地启动。
- `/` 和 `/dashboard` 可访问。
- shadcn/ui 基础组件可用。
- `AGENTS.md` 已生成。
- `README.md` 有项目定位和本地运行说明雏形。

---

## Day 2：认证 + Prisma + 数据库 Schema

### 目标

跑通用户登录和数据库基础模型。

### 上午：Clerk 接入

任务：

- 接入 Clerk。
- 配置登录 / 注册页面。
- 保护 `/dashboard`、`/resumes`、`/applications/*`、`/settings`。
- API route 未登录时返回 401。
- 顶部导航显示用户信息和退出入口。

### 下午：Prisma Schema

创建核心模型：

- `Resume`
- `ResumeExperience`
- `ResumeBullet`
- `Application`
- `BulletRewrite`
- `InterviewReview`
- `AiGeneration`

关键原则：

- 每个业务表必须有 `userId`。
- 所有查询必须验证当前用户。
- 不允许只用 URL id 查询记录。

创建：

- `src/lib/db/prisma.ts`
- `src/lib/db/ownership.ts`
- `src/lib/auth/current-user.ts`

### Codex prompt 示例

```txt
请根据 PRD 的数据模型实现 prisma/schema.prisma，并创建 src/lib/db/prisma.ts 和 src/lib/db/ownership.ts。
要求：所有业务表包含 userId；提供 assertResumeOwner、assertApplicationOwner 两个 helper；不要实现 UI。
完成后运行 pnpm prisma generate，并修复类型错误。
```

### 验收标准

- 登录后才能访问 dashboard。
- Prisma generate 成功。
- 数据库迁移成功。
- 基础 ownership helper 可被 API route 调用。

---

## Day 3：PDF 上传 + Resume 状态机

### 目标

先不调用 OpenAI，跑通“上传文件 → 创建简历记录 → 展示状态”。

### 上午：上传链路

任务：

- 接入 Vercel Blob。
- 实现 PDF 上传组件。
- 限制文件类型：PDF。
- 限制文件大小：建议 10MB。
- 上传后创建 `Resume` 记录。
- 状态流转：`UPLOADING` → `PARSING`。

### 下午：简历列表与详情壳

任务：

- `/resumes` 简历列表。
- `/resumes/[id]` 简历详情壳。
- 展示状态：上传中、解析中、失败、已完成。
- 支持删除、重命名。
- 添加“粘贴简历文本” fallback 入口，但可以先不实现 AI 解析。

### Codex prompt 示例

```txt
请实现 PDF 简历上传链路：前端上传组件、API route、Vercel Blob 存储、Resume 记录创建、状态显示。
今天不要调用 OpenAI，只保证文件和数据库链路正确。
请只修改 resumes 相关页面、api/resumes/upload 和必要的 db helper。
```

### 验收标准

- 用户能上传 PDF。
- 上传后 `/resumes` 出现简历卡片。
- 简历详情页能看到文件名、状态、上传时间。
- 非 PDF 或超大文件会被拒绝。

### 降级策略

如果 Vercel Blob 配置卡住超过半天：

- 先实现“粘贴简历文本创建 Resume”。
- PDF 上传放到 Day 4 / Day 7 补。

---

## Day 4：OpenAI 简历解析 + 结构化简历详情

### 目标

接入第一个核心 OpenAI 能力：把 PDF / 文本简历解析成结构化数据。

### 上午：AI schema 与 service

创建：

- `src/lib/ai/client.ts`
- `src/lib/ai/models.ts`
- `src/lib/ai/schemas/resume-parse.ts`
- `src/lib/ai/prompts/resume-parse.ts`
- `src/lib/ai/services/parse-resume.ts`
- `tests/ai/resume-parse.test.ts`

要求：

- 使用 Responses API。
- PDF 使用 `input_file`。
- 输出使用 Structured Outputs。
- 解析失败写入 `Resume.status = FAILED`。
- 成功后写入结构化 JSON，并生成 bullet 记录。

### 下午：简历详情页

任务：

- 展示姓名、联系方式、教育经历、项目 / 工作经历、技能。
- 每条 bullet 带稳定 `bulletId`。
- 每条 bullet 加可点击样式，为 Week 2 重写功能预留。
- 显示 AI 解析时间和解析状态。

### Codex prompt 示例

```txt
请实现 OpenAI 简历解析 service。
要求：使用 src/lib/ai/client.ts 统一初始化 OpenAI；schema 写在 src/lib/ai/schemas/resume-parse.ts；service 返回严格类型；API route 负责更新 Resume 状态和写入 ResumeBullet。
请添加一个 fixture 测试，验证 mock 输出能通过 Zod schema。
```

### 验收标准

- 上传后的简历可以触发解析。
- 解析结果能保存。
- 刷新页面后仍能看到结构化简历。
- JSON schema 校验失败时有错误提示。

---

## Day 5：新建投递 + JD 抽取

### 目标

跑通“粘贴 JD → AI 抽取岗位信息 → 创建投递”。

### 上午：Application CRUD

任务：

- 创建 `Application` CRUD。
- `/dashboard` 新建投递按钮。
- 新建投递 dialog。
- 字段：JD 原文、选择简历、公司名、岗位名、地点、阶段。
- 保存后生成投递卡片。

### 下午：JD 抽取

创建：

- `src/lib/ai/schemas/jd-extract.ts`
- `src/lib/ai/prompts/jd-extract.ts`
- `src/lib/ai/services/extract-jd.ts`

AI 输出字段：

- companyName
- roleTitle
- location
- seniority
- employmentType
- requiredSkills
- preferredSkills
- responsibilities
- confidence

### Codex prompt 示例

```txt
请实现新建投递流程：dashboard 上的 New Application dialog、Application API、JD 抽取 service。
粘贴 JD 后调用 OpenAI structured output 自动填充公司名、岗位名等字段，但用户必须可以手动编辑。
请不要实现诊断报告，今天只做投递创建和 JD 抽取。
```

### 验收标准

- 用户粘贴 JD 后能自动识别公司名和岗位名。
- 用户能手动修改 AI 识别结果。
- 保存后 dashboard 可看到投递卡片。
- 投递详情页可看到原始 JD。

---

## Day 6：Dashboard 看板 + 阶段更新

### 目标

让投递数据在看板中可视化，并能更新阶段。

### 上午：看板 UI

任务：

- `/dashboard` 五列：
  - 准备投递
  - 已投递
  - 沟通中
  - 面试中
  - Offer
- 卡片展示：公司名、岗位名、更新时间、当前阶段、匹配分占位。
- 顶部统计：总投递、沟通中、面试中、Offer。

### 下午：阶段更新

优先实现：

- 卡片上的阶段下拉。
- 更新后写数据库。
- 刷新后保持状态。

可选增强：

- dnd-kit 拖拽。

### Codex prompt 示例

```txt
请实现 dashboard 看板。优先使用阶段下拉更新状态，不要一开始做拖拽。
要求：五列固定状态、顶部统计卡片、空状态引导、点击卡片进入 /applications/[id]。
```

### 验收标准

- 投递卡片按阶段分列。
- 阶段更新后刷新不丢失。
- 点击卡片进入投递详情页。
- 没有投递时显示空状态引导。

### 降级策略

拖拽不做也可以。三周 MVP 中，下拉切换阶段比拖拽更重要。

---

## Day 7：Week 1 集成回归 + 第一次部署

### 目标

把 Week 1 的链路修到可演示状态，并完成第一次 Vercel 部署。

### 上午：回归测试

完整跑一遍：

1. 注册 / 登录。
2. 上传简历。
3. 解析简历。
4. 新建投递。
5. JD 抽取。
6. 看板展示。
7. 阶段更新。
8. 投递详情页查看 JD。

修复：

- 登录回调问题。
- 数据库查询权限问题。
- 上传失败问题。
- 解析失败后的状态问题。
- UI 空状态和 loading。

### 下午：部署

任务：

- 推送 GitHub。
- Vercel 导入项目。
- 配置环境变量。
- 跑通生产环境登录。
- 跑通至少一个完整简历上传和投递创建流程。

### Codex prompt 示例

```txt
请根据 Week 1 验收清单扫描当前代码，列出可能失败的主流程点，并修复高优先级问题。
修复后运行 pnpm check。不要新增 Week 2 功能。
```

### 验收标准

- 线上预览环境可访问。
- Week 1 主流程在线上能跑通。
- `docs/DEVLOG.md` 记录 Week 1 Retro：完成项、问题、下周风险。

---

# Week 2：AI 功能串联

## Week 2 目标

到 Day 14 结束，产品必须做到：

- JD 诊断报告可生成、可缓存、可展示。
- bullet 重写有真实 streaming 体验。
- bullet 可一键替换并保留历史。
- 打招呼话术可生成、复制、保存。
- 面试复盘可记录并生成 AI 建议。
- 周报洞察至少有 MVP 版本。
- AI 调用有统一日志、错误处理、成本估算和重试策略。

Week 2 的核心是让产品从“数据管理工具”变成“AI 求职工作台”。

---

## Day 8：JD 诊断报告后端

### 目标

实现产品最核心的 AI 服务：基于简历和 JD 生成匹配诊断。

### 上午：诊断 schema

创建：

- `src/lib/ai/schemas/diagnosis.ts`
- `src/lib/ai/prompts/diagnosis.ts`
- `src/lib/ai/services/generate-diagnosis.ts`
- `tests/ai/diagnosis.test.ts`

输出结构：

- matchScore: 0-100
- hr3sVerdict
- verdictLevel: red / yellow / green
- radarScores
- strengths
- gaps
- suggestions
- rewriteTargets
- estimatedInterviewRisk

### 下午：API route + 缓存

任务：

- `/api/applications/[id]/diagnose`
- 校验 application 归属。
- 读取 resume JSON + bullets + JD。
- 调用 OpenAI。
- 写入 `Application.diagnosisJson`。
- 写入 `AiGeneration` 日志。
- 支持 force regenerate。

### Codex prompt 示例

```txt
请实现 generateDiagnosis service 和 /api/applications/[id]/diagnose。
要求：使用 diagnosisSchema structured output；读取 Application + Resume + Bullet；生成后缓存到 diagnosisJson；记录 AiGeneration。
请添加 fixture 测试验证 schema。
不要实现前端 UI。
```

### 验收标准

- 后端能返回稳定结构化诊断 JSON。
- 结果能保存到数据库。
- 重复进入页面不会重复调用 OpenAI，除非用户点击重新生成。

---

## Day 9：诊断报告 UI

### 目标

把诊断 JSON 做成产品核心展示页。

### 上午：诊断 Tab

任务：

- 投递详情页新增 tabs：
  - 诊断报告
  - 原始 JD
  - bullet 重写
  - 打招呼话术
  - 面试复盘
- 诊断报告 Tab 展示：
  - HR 3 秒判断横幅。
  - 匹配分圆环。
  - 雷达图。
  - 优势。
  - 缺口。
  - 建议。
  - 推荐重写的 bullets。

### 下午：状态与交互

任务：

- 生成按钮。
- 重新生成按钮。
- loading skeleton。
- 失败状态。
- 成本提示。
- “应用到简历”入口，跳转到 bullet rewrite drawer。

### Codex prompt 示例

```txt
请实现投递详情页的诊断报告 Tab。
使用已有 diagnosisJson 渲染 UI；没有缓存时显示生成按钮；生成中显示 skeleton；失败时显示 error state。
请使用 Recharts 渲染 radarScores。
```

### 验收标准

- 用户点击生成后能看到诊断报告。
- 页面刷新后仍显示缓存结果。
- 重新生成会覆盖旧报告。
- 诊断报告足够清晰，能作为 demo 的核心截图。

---

## Day 10：bullet 重写 Streaming API

### 目标

实现第二个高光能力：针对 JD 对简历 bullet 进行流式改写。

### 上午：重写 service

创建：

- `src/lib/ai/schemas/bullet-rewrite.ts`
- `src/lib/ai/prompts/bullet-rewrite.ts`
- `src/lib/ai/services/rewrite-bullet.ts`
- `/api/ai/rewrite-bullet`

MVP 推荐两阶段策略：

1. 非流式 Structured Output 生成 3 个改写方向：label、why、重点关键词。
2. 用户选择方向后，对具体 bullet 内容进行 streaming 改写。

更高级版本：

- 三张卡片同时 streaming。

### 下午：streaming 响应适配

任务：

- 使用 Responses API streaming。
- 后端向前端返回 SSE 或 readable stream。
- 前端能逐字显示输出。
- 出错时能中止并提示。

### Codex prompt 示例

```txt
请实现 bullet rewrite 的 streaming API。
输入：resumeBulletId、applicationId、rewriteStyle。
后端校验用户权限，读取原 bullet、JD、diagnosisJson，然后使用 OpenAI Responses streaming 返回改写文本。
今天只做 API 和一个最小前端调试页面，不做完整 Drawer。
```

### 验收标准

- API 能流式返回文本。
- 前端能看到逐步生成效果。
- 断流或失败时不会卡死。

### 降级策略

如果 structured streaming 过于复杂：

- 先做 3 个非流式版本。
- 对用户选中的一个版本做单独 streaming 展开。

---

## Day 11：bullet 重写 Drawer + 一键替换

### 目标

把 Day 10 的 API 做成完整用户功能。

### 上午：Drawer UI

任务：

- 点击简历 bullet 打开右侧 Drawer。
- 选择目标投递。
- 显示原 bullet。
- 展示 3 个改写方向。
- 支持流式生成改写内容。

### 下午：应用与历史

任务：

- 一键替换 bullet。
- 替换后写入数据库。
- 保存 `BulletRewrite` 历史。
- 替换后视觉反馈。
- 支持恢复原文或查看历史，来不及则只保存历史不做 UI。

### Codex prompt 示例

```txt
请实现 bullet rewrite drawer。
要求：在 Resume detail 和 Application detail 都能触发；选择 application 后调用 rewrite API；显示 streaming 文本；点击 Apply 后更新 ResumeBullet.content，并创建 BulletRewrite 记录。
```

### 验收标准

- 点击 bullet 能打开重写 Drawer。
- 用户能看到 AI 改写。
- 用户能一键替换。
- 刷新后 bullet 是新内容。
- 替换历史已落库。

---

## Day 12：打招呼话术生成

### 目标

实现短平快但很实用的 AI 功能。

### 上午：话术 service

创建：

- `src/lib/ai/schemas/greeting.ts`
- `src/lib/ai/prompts/greeting.ts`
- `src/lib/ai/services/generate-greeting.ts`
- `/api/applications/[id]/greeting`

输出：

- direct：直接型。
- humble：谦逊型。
- highlight：亮点型。
- 每条 100 字以内。
- 每条包含适用场景说明。

### 下午：UI

任务：

- 投递详情页“打招呼话术”Tab。
- 生成按钮。
- 三张卡片展示。
- 一键复制。
- 复制成功 toast。
- 结果保存到 `Application.greetingJson`。

### Codex prompt 示例

```txt
请实现 greeting generation 功能。
后端用 OpenAI structured output 生成 3 种风格话术，保存到 Application.greetingJson。
前端在投递详情页新增 Greeting Tab，支持生成、缓存展示、一键复制和 toast。
```

### 验收标准

- 生成 3 条明显不同风格的话术。
- 每条不超过 100 字。
- 一键复制可用。
- 刷新后结果仍在。

---

## Day 13：面试复盘 + 周报洞察 MVP

### 目标

补齐“投递后续阶段”的 AI 价值。

### 上午：面试复盘

创建：

- `src/lib/ai/schemas/interview-review.ts`
- `src/lib/ai/prompts/interview-review.ts`
- `src/lib/ai/services/review-interview.ts`
- `/api/applications/[id]/interview-review`

功能：

- 用户输入面试问题、自己的回答、可选反馈。
- AI 输出：
  - 面试重点。
  - 回答薄弱点。
  - 下次准备建议。
  - 可复用表达。
- 结果保存到 `InterviewReview`。

### 下午：周报洞察 MVP

触发条件：

- 用户投递记录 ≥ 5。

输出：

- 投递数量。
- 平均匹配分。
- 最强维度。
- 最弱维度。
- 高频缺失技能。
- 下一步建议。

可以先做：

- 后端聚合数据。
- AI 生成一段洞察。
- Dashboard 顶部展示周报卡片。

### Codex prompt 示例

```txt
请实现两个 P1 AI 功能：interview review 和 weekly insight。
优先保证 interview review 完整可用；weekly insight 可以做 MVP：投递数 >= 5 时展示一个 AI 生成的洞察卡片。
不要引入复杂定时任务，用户点击生成即可。
```

### 验收标准

- 面试复盘可创建多条。
- 每条复盘能生成 AI 建议。
- 投递数 ≥ 5 时 dashboard 可以生成周报。
- 投递不足 5 条时显示引导。

### 降级策略

如果当天时间不足：

- 保留面试复盘。
- 周报只做非 AI 统计卡片，Day 14 或 Week 3 再补 AI。

---

## Day 14：AI 平台层加固

### 目标

把 Week 2 分散写的 AI 调用统一成可维护的工程层。

### 上午：统一 AI service

任务：

- `src/lib/ai/models.ts`：模型路由。
- `src/lib/ai/usage.ts`：token / cost 日志。
- `src/lib/ai/safety.ts`：输入长度、敏感输入、prompt injection 基础规则。
- `src/lib/ai/errors.ts`：统一错误类型。
- `src/lib/ai/retry.ts`：schema 失败重试一次。

### 下午：回归 Week 2 AI 功能

回归：

- 简历解析。
- JD 抽取。
- 诊断报告。
- bullet 重写。
- 打招呼话术。
- 面试复盘。
- 周报洞察。

补：

- AI 调用前检查登录和 ownership。
- 每次调用写 `AiGeneration`。
- 页面展示基础错误状态。

### Codex prompt 示例

```txt
请重构 AI 调用层，不改变 UI 行为。
目标：统一模型选择、错误处理、AiGeneration 日志、schema parse 重试、输入长度限制。
请逐个扫描 src/lib/ai/services，消除重复代码，并保证 pnpm check 通过。
```

### 验收标准

- 所有 AI route 都有日志。
- 所有 AI route 都有权限校验。
- schema 失败会自动重试一次。
- 用户看到的错误提示可理解。
- `pnpm check` 通过或只剩已记录的非阻塞问题。

---

# Week 3：打磨 + 安全 + 上线包装

## Week 3 目标

到 Day 21 结束，产品必须做到：

- 线上产品主流程稳定。
- UI 状态完整：loading、empty、error、toast。
- 基础安全和成本控制到位。
- README、截图、架构图、演示数据完整。
- 有最终验收清单和后续 backlog。

Week 3 的核心不是继续堆功能，而是把已有功能打磨成“别人打开链接就能理解和使用”的状态。

---

## Day 15：UI 状态补齐

### 目标

补齐所有异步操作的 loading、empty、error、toast。

### 上午：页面扫描

扫描页面：

- `/dashboard`
- `/resumes`
- `/resumes/[id]`
- `/applications/[id]`
- `/settings`

补齐：

- skeleton。
- 空状态。
- 错误状态。
- toast。
- 删除确认 dialog。

### 下午：表单体验

任务：

- 表单校验错误提示。
- 按钮 loading 状态。
- 防重复提交。
- AI 生成中禁用重复点击。
- 长文本输入字数提示。

### Codex prompt 示例

```txt
请扫描 app/(app) 下所有页面，为异步数据、空列表、错误、提交中状态补齐 UI。
不要新增业务功能，只提升现有页面完成度。
优先使用 shadcn/ui 的 skeleton、toast、dialog。
```

### 验收标准

- 用户不会看到突兀空白。
- 每个 AI 生成按钮都有 loading 和失败反馈。
- 每个删除操作都有确认。
- 表单错误清晰。

---

## Day 16：响应式 + 可访问性 + 小交互

### 目标

让产品在不同屏幕上基本可用，并补齐常见交互细节。

### 上午：响应式

任务：

- dashboard 看板在手机上横向滚动或切换列。
- 投递详情 tabs 在小屏幕可用。
- Drawer 在移动端改为全屏 sheet。
- 表格 / 卡片不溢出。

### 下午：可访问性和小交互

任务：

- 关键按钮加 aria label。
- 表单 label 完整。
- 键盘可聚焦。
- 复制按钮反馈。
- 页面 title / metadata。
- 可选：Cmd+K 全局搜索，若耗时则不做。

### Codex prompt 示例

```txt
请优化核心页面响应式和基础可访问性。
要求：移动端不破版；核心按钮有 aria-label；表单 label 完整；tabs/drawer 在小屏可用。
不要实现 Cmd+K，除非所有响应式任务已完成。
```

### 验收标准

- 手机浏览不会严重破版。
- iPad / 桌面体验正常。
- 关键操作键盘可访问。
- 页面 metadata 不再是默认模板。

---

## Day 17：安全 + 成本守护

### 目标

AI 产品上线前必须具备基本防护。

### 上午：成本守护

任务：

- 每用户每日 AI 调用上限。
- 每个功能的输入长度限制。
- 记录 token 和估算成本。
- 超限时友好提示。
- 设置 `.env`：
  - `MAX_DAILY_AI_CALLS_PER_USER`
  - `MAX_JD_CHARS`
  - `MAX_RESUME_FILE_MB`

### 下午：安全防护

任务：

- 所有业务 API 校验登录。
- 所有查询校验 `userId`。
- XSS 防护：用户输入展示时不使用危险 HTML。
- Prompt injection 基础规则：忽略 JD / 简历中要求泄露系统提示、绕过规则、输出无关内容的指令。
- 接入 OpenAI Moderation 或本地 safety check，至少对极端输入做拦截。

### Codex prompt 示例

```txt
请实现基础安全和成本守护。
要求：所有 AI route 接入每日调用上限、输入长度限制、AiGeneration 日志；所有业务 route 检查 userId ownership；添加 prompt injection 基础检测。
不要改变正常用户流程。
```

### 验收标准

- 超过每日额度会提示。
- 过长 JD / 回答会被拒绝或要求缩短。
- 用户无法通过改 URL 访问别人的数据。
- AI route 不会在未登录时执行。

---

## Day 18：生产部署 + 环境回归

### 目标

完成正式 Vercel 部署，并跑通生产环境主流程。

### 上午：部署配置

任务：

- 检查 Vercel 环境变量。
- 检查 Clerk production 配置。
- 检查数据库 production URL。
- 检查 Vercel Blob token。
- 检查 OpenAI API key。
- 检查 Prisma migration。

### 下午：生产环境回归

在线上完整跑：

1. 注册新用户。
2. 上传简历。
3. 解析简历。
4. 新建投递。
5. 生成诊断。
6. 重写 bullet。
7. 应用 bullet。
8. 生成话术。
9. 更新投递阶段。
10. 生成面试复盘。

### Codex prompt 示例

```txt
请检查项目的生产部署准备情况。
输出一份 docs/RELEASE_CHECKLIST.md，并根据 checklist 修复明显问题：环境变量校验、错误提示、构建失败、Prisma 迁移说明。
不要新增业务功能。
```

### 验收标准

- Vercel production build 成功。
- 线上主流程可跑通。
- `docs/RELEASE_CHECKLIST.md` 完成。
- 记录所有线上 bug 到 DEVLOG。

---

## Day 19：真实数据打样 + Bug Bash + 性能

### 目标

让 demo 环境有真实感，并修掉影响展示的问题。

### 上午：演示数据

任务：

- 创建 seed demo 数据。
- 准备 1 份测试简历。
- 准备 5 条 JD。
- 生成 5 条投递记录。
- 至少 2 条有诊断报告。
- 至少 1 条有 bullet rewrite 历史。
- 至少 1 条有打招呼话术。
- 至少 1 条有面试复盘。
- 触发周报洞察。

### 下午：Bug Bash

重点检查：

- 新用户空状态。
- 生成失败后的重试。
- 页面刷新后的缓存。
- 删除数据后的关联记录。
- 生产环境文件上传。
- 生产环境 AI 调用超时。
- 数据权限。
- 移动端破版。

### Codex prompt 示例

```txt
请实现 prisma seed demo data，并创建一个 smoke test 覆盖核心流程入口。
随后根据手动 bug bash 记录修复高优先级问题。
不要做新功能。
```

### 验收标准

- demo 账号或演示数据准备好。
- dashboard 不是空的。
- 周报可以展示。
- 严重 bug 已修复。
- 性能没有明显卡顿。

---

## Day 20：README + 架构图 + Demo 素材

### 目标

把项目包装成别人一眼能看懂的作品。

### 上午：README 完整版

README 建议结构：

```md
# 第一页 / Prologue

> AI 求职工作台：把投递、诊断、改简历、沟通、复盘串成一个闭环。

## Live Demo

## 产品截图

## 它解决什么问题

## 核心功能

## 技术栈

## OpenAI API 集成

## 架构图

## 数据模型

## 本地运行

## 环境变量

## 测试

## 部署

## Roadmap
```

必须写清楚：

- 为什么选择 Next.js + Prisma + Clerk + OpenAI。
- 哪些功能使用 Structured Outputs。
- 哪些功能使用 Streaming。
- PDF 文件如何进入 OpenAI 解析流程。
- AI 成本和安全如何处理。

### 下午：Demo 素材

任务：

- 截图：dashboard、简历详情、诊断报告、bullet 重写、话术、周报。
- 录制 1 个 2-3 分钟 demo 视频，或者至少准备 demo 脚本。
- 生成 mermaid 架构图。
- 生成一张功能流程图。

### Codex prompt 示例

```txt
请根据当前代码和 docs 生成 README 完整版。
要求包含：产品定位、功能截图占位、技术栈、OpenAI API 集成说明、mermaid 架构图、本地运行、环境变量、测试、部署、Roadmap。
不要夸大尚未实现的功能，未完成的放入 Roadmap。
```

### 验收标准

- README 可以独立说明项目价值。
- README 不虚构功能。
- 架构图和本地运行说明清晰。
- 至少有 4 张截图或 GIF。

---

## Day 21：最终验收 + 冻结版本

### 目标

冻结一个可展示版本，而不是继续无止境加功能。

### 上午：最终验收

按最终 checklist 检查：

#### 主流程

- [ ] 登录 / 注册可用。
- [ ] 未登录无法访问工作台。
- [ ] PDF 简历上传可用。
- [ ] 简历解析可用。
- [ ] 简历详情可展示结构化数据。
- [ ] 新建投递可用。
- [ ] JD 抽取可用。
- [ ] 看板阶段更新可用。
- [ ] 诊断报告可生成。
- [ ] 诊断报告可缓存。
- [ ] bullet 重写可流式输出。
- [ ] bullet 可一键替换。
- [ ] 打招呼话术可生成和复制。
- [ ] 面试复盘可生成。
- [ ] 周报洞察可展示。

#### 工程

- [ ] `pnpm check` 通过。
- [ ] Prisma migration 已提交。
- [ ] 生产环境变量配置完整。
- [ ] AI 调用有日志。
- [ ] 所有业务 API 有权限校验。
- [ ] 主要页面有 loading / empty / error。
- [ ] README 完整。
- [ ] AGENTS.md 完整。
- [ ] RELEASE_CHECKLIST.md 完整。

### 下午：冻结版本

任务：

- 修复最后的 P0 bug。
- 创建 release tag：`v0.1.0`。
- 整理 Roadmap。
- 把未完成的功能从 README 移到 Roadmap。
- 删除无用代码、mock、调试日志。
- 备份 demo 数据。

### Codex prompt 示例

```txt
请根据 docs/RELEASE_CHECKLIST.md 做最终验收。
先列出未通过项，再只修复 P0/P1 问题。
不要新增功能。最后帮我生成 v0.1.0 release notes。
```

### 验收标准

- 线上版本稳定。
- GitHub 仓库干净。
- README 完整可信。
- 项目可以作为 portfolio 展示。
- 后续需求都进入 Roadmap，不再临时加功能。

---

# 5. 三周总 Checklist

## Week 1：地基 + 数据闭环

- [ ] Day 1：项目初始化 + AGENTS.md + 基础 layout。
- [ ] Day 2：Clerk + Prisma schema + ownership helper。
- [ ] Day 3：PDF 上传 + Resume 状态机。
- [ ] Day 4：OpenAI 简历解析 + 结构化简历详情。
- [ ] Day 5：新建投递 + JD 抽取。
- [ ] Day 6：Dashboard 看板 + 阶段更新。
- [ ] Day 7：Week 1 回归 + Vercel 首次部署。

## Week 2：AI 功能串联

- [ ] Day 8：JD 诊断报告后端。
- [ ] Day 9：诊断报告 UI。
- [ ] Day 10：bullet 重写 streaming API。
- [ ] Day 11：bullet 重写 Drawer + 一键替换。
- [ ] Day 12：打招呼话术。
- [ ] Day 13：面试复盘 + 周报洞察 MVP。
- [ ] Day 14：AI 平台层加固。

## Week 3：打磨 + 安全 + 上线包装

- [ ] Day 15：loading / empty / error / toast。
- [ ] Day 16：响应式 + 可访问性。
- [ ] Day 17：安全 + 成本守护。
- [ ] Day 18：生产部署 + 环境回归。
- [ ] Day 19：真实数据打样 + Bug Bash。
- [ ] Day 20：README + 架构图 + Demo 素材。
- [ ] Day 21：最终验收 + v0.1.0 冻结。

---

# 6. 功能降级规则

三周项目最容易失败的原因是“每个功能都想做完整”。以下降级规则必须严格执行。

| 风险 | 触发条件 | 降级方案 |
|---|---|---|
| PDF 上传卡住 | Day 3 半天未跑通 | 先做粘贴简历文本 fallback |
| PDF 解析不稳定 | Day 4 解析失败率高 | 保留原文上传，允许用户手动粘贴文本解析 |
| 看板拖拽耗时 | Day 6 超过 3 小时 | 改用阶段下拉 |
| 诊断报告太复杂 | Day 9 UI 做不完 | 先做分数 + 优势 + 缺口 + 建议，雷达图后补 |
| 三卡片 streaming 复杂 | Day 10 卡住 | 先做单版本 streaming |
| bullet 替换历史复杂 | Day 11 做不完 | 只保存历史，不做历史 UI |
| 周报洞察做不完 | Day 13 时间不足 | 只做统计卡片，AI 周报后补 |
| 响应式耗时 | Day 16 时间不足 | 保证桌面和 iPad，手机不严重破版即可 |
| README 缺截图 | Day 20 截图不足 | 用 screenshot 占位，明确标注后续补充 |

---

# 7. Codex 使用规范

## 7.1 每次给 Codex 的任务格式

建议固定成：

```txt
目标：
今天要完成什么。

范围：
允许修改哪些文件 / 目录。

限制：
不要做什么，不要引入什么依赖。

验收：
完成后应该满足哪些行为。

检查：
请运行 pnpm check；如果失败，说明原因并修复。
```

## 7.2 不要这样使用 Codex

避免一次性发：

```txt
帮我把整个产品做完。
```

应该拆成：

```txt
只实现 diagnosisSchema 和 generateDiagnosis service，不做 UI。
```

或者：

```txt
只实现投递详情页 Diagnosis Tab，使用已有 diagnosisJson 渲染，不改后端。
```

## 7.3 每天推荐 Codex 流程

1. `/plan`：先让 Codex 给出实现计划。
2. 确认文件范围。
3. 让 Codex 实现。
4. `/diff`：看 diff。
5. 跑 `pnpm check`。
6. `/review`：让 Codex 自查。
7. 手动测试主流程。
8. commit。

---

# 8. OpenAI API 实现清单

## 8.1 AI services

- [ ] `parseResume()`
- [ ] `extractJD()`
- [ ] `generateDiagnosis()`
- [ ] `rewriteBulletStream()`
- [ ] `generateGreeting()`
- [ ] `reviewInterview()`
- [ ] `generateWeeklyInsight()`

## 8.2 AI schemas

- [ ] `resumeParseSchema`
- [ ] `jdExtractSchema`
- [ ] `diagnosisSchema`
- [ ] `bulletRewriteSchema`
- [ ] `greetingSchema`
- [ ] `interviewReviewSchema`
- [ ] `weeklyInsightSchema`

## 8.3 AI engineering

- [ ] 统一 OpenAI client。
- [ ] 统一模型路由。
- [ ] 统一 schema parse。
- [ ] 统一错误处理。
- [ ] 统一 AI 日志。
- [ ] 统一输入长度限制。
- [ ] 统一每日调用限制。
- [ ] 统一 prompt injection 基础防护。
- [ ] 统一成本估算。

---

# 9. 最小可交付版本定义

如果三周时间明显不足，最终 MVP 可以压缩为：

1. 登录。
2. 粘贴简历文本或上传 PDF。
3. OpenAI 简历解析。
4. 新建投递 + JD 抽取。
5. 看板管理。
6. JD 诊断报告。
7. bullet 重写。
8. 打招呼话术。
9. Vercel 部署。
10. README 完整。

可以砍掉：

- dnd-kit 拖拽。
- 面试复盘。
- 周报洞察。
- Cmd+K。
- Diff 视图。
- 移动端深度优化。
- Demo 视频。

不能砍掉：

- 数据权限。
- OpenAI 结构化输出。
- 诊断报告。
- bullet 重写。
- README。
- 线上部署。

---

# 10. 最终判断标准

这个项目三周后是否成功，不看功能数量，而看以下五点：

1. **主流程是否完整**：用户能从上传简历走到诊断、重写、话术。
2. **AI 能力是否真实**：不是 mock，不是静态模板，而是真正调用 OpenAI API。
3. **输出是否稳定**：Structured Outputs 能驱动 UI，不靠手动猜 JSON。
4. **工程是否清晰**：Codex 能读懂目录、schema、service、测试。
5. **作品是否可信**：线上可用，README 清楚，截图和数据完整。

完成这五点，就已经是一个能拿出去展示的 AI 产品项目。
