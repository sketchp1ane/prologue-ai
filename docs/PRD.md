# 《第一页 / Prologue》PRD — Codex + OpenAI API 适配版

> 把每一次投递，变成一次 offer 的前奏。  
> 文档类型：产品需求文档（PRD）  
> 版本：v1.1  
> 日期：2026-04-24  
> 目标：用约 3 周完成一个可上线、可演示、可真实使用的 AI 求职工作台  
> 技术策略：不拘泥原技术栈，以 Codex 友好、OpenAI API 适配、三周交付为优先

---

## 0. 本次修改结论

本版不再默认沿用原计划中的 Supabase 全家桶或固定技术栈，而是按以下优先级重新选择：

1. **Codex 容易理解和修改**：目录清晰、TypeScript 单语言、Schema-first、测试命令明确。
2. **OpenAI API 直接适配**：核心 AI 能力优先使用 OpenAI Responses API、Structured Outputs、File Inputs、Streaming、Moderation。
3. **三周内可完成**：减少自建后端、复杂鉴权、复杂 RLS、LangChain、RAG、队列系统等非必要工程量。
4. **上线路径短**：前端、后端、文件、数据库、部署尽量贴合 Vercel + Next.js 生态。
5. **能沉淀为作品**：不仅功能可用，代码结构、README、DEVLOG、演示数据也要能展示工程判断。

### 0.1 推荐技术栈摘要

| 层级 | 选型 | 选择理由 |
|---|---|---|
| 应用框架 | **Next.js App Router** | 全栈一体，页面、API Route、Server Component、部署都清晰，Codex 熟悉度高 |
| 语言 | **TypeScript strict** | 类型约束强，便于 Codex 按类型修复和重构 |
| UI | **Tailwind CSS + shadcn/ui + Radix UI + lucide-react** | 组件可复制、样式局部、适合快速产出高质量界面 |
| 表单与校验 | **React Hook Form + Zod** | 表单、API 入参、OpenAI 输出 schema 可共用一套类型思想 |
| 数据库 | **Postgres + Prisma ORM**，推荐 Neon / Prisma Postgres | `schema.prisma` 是强约束源，Codex 容易基于 schema 生成 CRUD、迁移、查询 |
| 认证 | **Clerk** | 快速接入 Next.js，减少三周项目中的鉴权实现成本 |
| 文件存储 | **Vercel Blob** | 与 Vercel 部署贴合，适合 PDF 简历上传；敏感文件建议私有存储 |
| AI 调用 | **OpenAI TypeScript SDK + Responses API** | 直接贴合 OpenAI API，不先做多供应商抽象 |
| 流式输出 | **OpenAI Responses streaming**；必要时用 Vercel AI SDK 简化 UI streaming | bullet 重写需要即时反馈；实现复杂时可用 AI SDK 降低样板代码 |
| 图表 | **Recharts** | 轻量、常见、Codex 易生成 |
| 拖拽 | **dnd-kit**，可降级为状态下拉 | 看板交互加分，但不阻塞主链路 |
| 测试 | **Vitest + Playwright smoke test** | 单元测试覆盖 AI schema / util；Playwright 只测核心流程 |
| 部署 | **Vercel** | Next.js 原生部署路径最短 |

### 0.2 技术栈变化

| 原 PRD 默认 | 本版调整 | 原因 |
|---|---|---|
| Supabase Auth | Clerk | 三周内减少登录、session、回调配置成本 |
| Supabase Postgres + RLS | Postgres + Prisma | Prisma schema 更适合 Codex 读写、生成迁移和类型化查询 |
| Supabase Storage | Vercel Blob | 与 Vercel / Next.js 上传链路更统一 |
| 多模型 Provider 抽象 | 先做 OpenAI-only AI service | MVP 目标是 OpenAI API 适配，不提前抽象未来可能不用的 provider |
| Claude/Anthropic SDK | OpenAI TypeScript SDK | AI 能力统一走 OpenAI Responses API |
| LangChain / agent 框架 | 不使用 | 当前功能是结构化提取、诊断、重写，不需要复杂 agent 编排 |
| 大型后端服务 | 不使用 | Next.js Route Handlers 足够支撑 MVP |

---

## 1. 产品概述

### 1.1 产品名称

第一页 / Prologue

### 1.2 产品定位

面向个人求职者的 AI 求职工作台。用户可以在一个产品中完成：简历上传、岗位投递管理、JD 匹配诊断、简历 bullet 优化、BOSS / HR 打招呼话术生成、面试复盘和求职周报洞察。

### 1.3 一句话描述

用 AI 帮求职者把“投递、分析、修改、跟进、复盘”串成一个闭环，而不是每次都从零开始复制粘贴简历和 JD。

### 1.4 核心价值

- **投递过程可视化**：用看板管理每一次投递进展。
- **岗位匹配可解释**：基于简历和 JD 输出匹配度、优势、缺口和行动建议。
- **简历修改可执行**：把诊断建议落到具体 bullet 的重写版本上。
- **沟通表达更高效**：根据岗位和简历自动生成短、准、有针对性的打招呼话术。
- **求职数据产生复利**：当投递数据积累后，生成周报和趋势洞察。

---

## 2. 产品目标与非目标

### 2.1 MVP 目标

三周内完成一个可上线、可演示、可真实使用的产品闭环：

- 用户可以注册、登录、进入受保护工作台。
- 用户可以上传 PDF 简历，并得到结构化解析结果。
- 用户可以创建投递记录，并通过看板管理投递状态。
- 用户可以把 JD 和简历一起交给 AI 生成诊断报告。
- 用户可以针对某个岗位重写简历 bullet，并看到流式输出。
- 用户可以生成 BOSS / HR 打招呼话术。
- 用户可以记录面试复盘，并获得 AI 洞察。
- 当投递记录达到一定数量后，用户可以看到 AI 求职周报。
- 产品部署上线，生产环境核心流程可跑通。

### 2.2 非目标

以下内容不进入 MVP：

- 模拟面试语音 / 视频功能。
- 企业 ATS / 招聘方后台。
- 多人协作。
- 浏览器插件自动抓取招聘网站。
- 复杂简历排版编辑器。
- 付费订阅、支付、发票。
- 大规模 RAG 知识库。
- LangChain / Crew / AutoGPT 式 agent 编排。
- 自建认证服务。
- 独立 NestJS / Express 后端。
- 完整移动端小程序。

---

## 3. 目标用户与核心痛点

### 3.1 核心用户

正在主动求职的个人用户，尤其是：

- 应届生。
- 转行求职者。
- 准备找实习的学生。
- 希望进入 AI / 产品 / 前端 / 全栈相关岗位的候选人。
- 投递数量较多、需要管理和复盘的求职者。

### 3.2 用户痛点

| 痛点 | 当前做法 | 产品解决方式 |
|---|---|---|
| 投递记录混乱 | Excel / Notion / 手写 | 看板统一管理 |
| 不知道简历和 JD 匹配度 | 自己读 JD | AI 诊断报告 |
| 简历修改没有方向 | 反复手动改 | AI 根据岗位重写 bullet |
| 打招呼话术重复低效 | 临时手写 / 套模板 | AI 生成多风格短话术 |
| 面试复盘难沉淀 | 面完就忘 | 记录问题与回答，AI 提炼下次建议 |
| 投递多了看不出趋势 | 靠感觉 | 周报总结投递数据与弱项 |

---

## 4. 核心用户流程

### 4.1 主流程

1. 用户注册 / 登录。
2. 进入 `/dashboard`，看到空状态引导。
3. 上传 PDF 简历。
4. 系统使用 OpenAI 解析简历，生成结构化简历数据。
5. 用户新建投递：粘贴 JD，选择简历。
6. 系统自动提取公司名、岗位名、地点、岗位级别等信息。
7. 投递记录进入看板。
8. 用户进入投递详情页，生成 JD 诊断报告。
9. 用户根据诊断建议，点击简历 bullet 进行 AI 重写。
10. 用户选择一个重写版本并应用到简历。
11. 用户生成打招呼话术，一键复制。
12. 投递进入面试阶段后，用户填写面试问题与回答。
13. 系统生成面试复盘建议。
14. 当投递数量达到 5 条以上，看板顶部出现 AI 求职周报。

### 4.2 核心闭环

上传简历 → 新建投递 → JD 诊断 → bullet 重写 → 话术生成 → 看板跟进 → 面试复盘 → 周报洞察

---

## 5. 功能范围

### 5.1 P0：三周内必须完成

| 模块 | 功能 | 验收重点 |
|---|---|---|
| 账号系统 | 注册、登录、受保护路由 | 未登录无法访问个人数据 |
| 简历管理 | PDF 上传、AI 解析、列表、详情、删除、重命名 | 简历可进入结构化状态 |
| 投递管理 | 新建投递、JD 抽取、编辑、删除 | AI 能自动识别公司和岗位 |
| 看板 | 5 列状态、卡片、阶段更新、统计 | 刷新后状态保持 |
| JD 诊断 | 匹配分、HR 3 秒判断、优势、缺口、建议 | 结构化结果能驱动 UI |
| bullet 重写 | 点击 bullet、选择投递、流式生成 3 个版本、一键替换 | 有可感知 streaming |
| 打招呼话术 | 生成 3 种风格、一键复制 | 100 字以内、可复制 |
| AI 成本记录 | 记录 feature / model / tokens / cost | 每次调用可追踪 |
| 基础安全 | 鉴权、输入长度、prompt injection 防护 | 用户数据隔离 |
| 部署 | Vercel 生产环境 | 核心流程线上可跑通 |

### 5.2 P1：优先增强

| 模块 | 功能 | 说明 |
|---|---|---|
| 面试复盘 | 记录问题和回答，AI 生成复盘建议 | 投递进入面试中后显示 |
| AI 求职周报 | 投递数 ≥ 5 时生成周报洞察 | 用累计数据展示“复利感” |
| UI 状态 | loading、skeleton、empty state、error state、toast | 提升完成度 |
| 响应式 | iPad / 手机基础可用 | 不追求移动端完美 |
| 原始 JD | 投递详情页折叠查看完整 JD | 方便回看 |

### 5.3 P2：可选加分

| 模块 | 功能 | 降级策略 |
|---|---|---|
| 看板拖拽 | dnd-kit 拖拽更新阶段 | 如耗时，先用下拉切换状态 |
| 全局搜索 | Cmd+K 搜索简历、公司、岗位 | 不影响主流程 |
| Diff 视图 | bullet 替换前后对比 | 可先只保留历史 |
| 导出 | 导出诊断报告或优化后简历 | Week 3 之后再做 |
| 分享 | 生成只读分享链接 | 不进 MVP |

---

## 6. 信息架构与页面

| 页面 | 路由 | 说明 |
|---|---|---|
| 登录 / 注册 | Clerk 托管或 `/sign-in` / `/sign-up` | 使用 Clerk 预置组件或嵌入式页面 |
| 工作台 | `/dashboard` | 投递看板、统计、周报入口 |
| 简历列表 | `/resumes` | 查看、上传、删除、重命名简历 |
| 简历详情 | `/resumes/[id]` | 展示结构化简历，支持 bullet 点击重写 |
| 投递详情 | `/applications/[id]` | JD、诊断、重写、话术、复盘等 Tab |
| 设置页 | `/settings` | API 使用额度、账号信息、偏好设置 |

### 6.1 看板列

MVP 使用 5 列固定状态：

1. 准备投递 `preparing`
2. 已投递 `applied`
3. 沟通中 `communicating`
4. 面试中 `interviewing`
5. Offer `offer`

拒绝 / 放弃建议作为 `archived` 状态，不进入主看板列。

---

## 7. Codex 友好工程规范

这部分是本版 PRD 的重点。项目不仅要能跑，还要让 Codex 容易接手、拆分、验证和修复。

### 7.1 目录结构

```txt
prologue/
  AGENTS.md
  README.md
  DEVLOG.md
  package.json
  prisma/
    schema.prisma
    migrations/
  docs/
    PRD.md
    ARCHITECTURE.md
    OPENAI_SCHEMAS.md
    CODEX_TASKS.md
  src/
    app/
      (marketing)/
      (app)/dashboard/
      (app)/resumes/
      (app)/applications/
      api/
        resumes/
        applications/
        ai/
    components/
      ui/
      layout/
      resume/
      applications/
      ai/
    features/
      resumes/
        components/
        actions.ts
        queries.ts
        schemas.ts
      applications/
        components/
        actions.ts
        queries.ts
        schemas.ts
      ai/
        services/
        prompts/
        schemas/
        cost.ts
        moderation.ts
    lib/
      auth.ts
      db.ts
      openai.ts
      blob.ts
      rate-limit.ts
      utils.ts
    tests/
      fixtures/
      unit/
      e2e/
```

### 7.2 `AGENTS.md` 必须包含

`AGENTS.md` 是给 Codex 的长期上下文，不是普通 README。必须写清楚：

- 项目目标：AI 求职工作台，不做招聘方后台。
- 运行命令：安装、dev、lint、test、migrate。
- 目录约定：AI prompt 不允许散落在 route handler 中。
- 类型约定：所有 AI 输出必须经过 Zod / JSON Schema 校验。
- 数据权限：所有查询必须带 `userId`。
- 完成标准：功能完成后必须跑 `pnpm lint`、`pnpm test`，必要时跑 Playwright smoke。
- 禁止事项：不引入 LangChain，不新建独立后端，不把 OpenAI Key 暴露到前端，不在客户端直接调用 OpenAI。

### 7.3 Codex 任务拆分原则

每个 Codex 任务控制在 1 个清晰模块内：

| 好任务 | 坏任务 |
|---|---|
| “根据 `prisma/schema.prisma` 实现 resume list 页面和查询函数” | “把整个简历模块做完” |
| “为 `diagnosisSchema` 写 OpenAI structured output service 和单元测试” | “做 AI 诊断功能” |
| “把 bullet rewrite API 改成 streaming，并保持现有测试通过” | “优化 AI 体验” |

每个任务 prompt 使用四段式：

```txt
Goal: 要完成什么
Context: 相关文件和当前状态
Constraints: 不能违反的架构/安全/类型要求
Done when: 什么测试通过、什么页面可用、什么行为出现
```

### 7.4 Schema-first 规则

所有关键数据先写 schema，再写 UI 和 API：

- DB：`prisma/schema.prisma`
- 表单：`src/features/*/schemas.ts`
- AI 输出：`src/features/ai/schemas/*.ts`
- Prompt：`src/features/ai/prompts/*.ts`
- 测试 fixture：`src/tests/fixtures/*.json`

这样 Codex 可以从类型和 schema 推导实现，减少“猜业务字段”的错误。

### 7.5 推荐脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "check": "pnpm typecheck && pnpm lint && pnpm test"
  }
}
```

---

## 8. OpenAI API 实现方案

### 8.1 使用边界

产品内所有 AI 能力统一走 OpenAI：

| 产品能力 | OpenAI 能力 | 输出方式 |
|---|---|---|
| 简历 PDF 解析 | Responses API + File Inputs + Structured Outputs | JSON |
| JD 信息抽取 | Responses API + Structured Outputs | JSON |
| JD 诊断报告 | Responses API + Structured Outputs | JSON |
| bullet 重写 | Responses API + Streaming | 流式文本 / 分段 JSON |
| 打招呼话术 | Responses API + Structured Outputs | JSON |
| 面试复盘 | Responses API + Structured Outputs | JSON |
| 求职周报 | Responses API + Structured Outputs | JSON |
| 安全过滤 | Moderation API + 本地规则 | 判定结果 |

### 8.2 模型路由

所有模型 ID 必须通过环境变量配置，不在业务代码硬编码。

```env
OPENAI_MODEL_EXTRACT=gpt-5.4-nano
OPENAI_MODEL_PARSE=gpt-5.4-mini
OPENAI_MODEL_DIAGNOSE=gpt-5.4
OPENAI_MODEL_REWRITE=gpt-5.4-mini
OPENAI_MODEL_GREETING=gpt-5.4-mini
OPENAI_MODEL_REVIEW=gpt-5.4-mini
OPENAI_MODEL_WEEKLY=gpt-5.4-mini
```

| 场景 | 默认模型 | 原因 |
|---|---|---|
| JD 公司 / 岗位抽取 | `gpt-5.4-nano` | 高频、简单、低成本 |
| 简历 PDF 解析 | `gpt-5.4-mini` | 需要文档理解，成本可控 |
| JD 诊断报告 | `gpt-5.4` | 核心体验，需要更强综合判断 |
| bullet 重写 | `gpt-5.4-mini` | 文案质量与成本平衡 |
| 打招呼话术 | `gpt-5.4-mini` | 短文本生成，质量要稳定 |
| 面试复盘 | `gpt-5.4-mini` | 中等复杂度分析 |
| 求职周报 | `gpt-5.4-mini` | 多条数据汇总 |

如当前 API 账户没有某个模型权限，应只改环境变量，不改业务代码。

### 8.3 OpenAI service 封装

```ts
// src/lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

```ts
// src/features/ai/services/generateStructured.ts
export async function generateStructured<T>(params: {
  feature: AiFeature;
  model: string;
  instructions: string;
  input: unknown;
  schemaName: string;
  jsonSchema: object;
  userId: string;
}): Promise<T> {
  // 1. check rate limit
  // 2. call OpenAI Responses API with text.format json_schema
  // 3. validate result with Zod
  // 4. write ai_generations log
  // 5. return typed output
}
```

```ts
// src/features/ai/services/streamRewrite.ts
export async function streamBulletRewrite(params: {
  userId: string;
  bulletId: string;
  applicationId: string;
}) {
  // OpenAI Responses API stream: true
  // Return SSE / ReadableStream to client
}
```

### 8.4 Prompt 设计规则

所有 prompt 必须满足：

- `developer instruction` 和用户输入分离。
- 简历、JD、面试问题都被视为数据，不可覆盖系统指令。
- 不编造公司、学校、指标、项目结果。
- 不确定信息进入 `warnings` 或 `confidence` 字段。
- 所有落库结果必须符合 JSON Schema。
- Prompt 文件集中存放，禁止在 route handler 里写大段 prompt。

### 8.5 PDF 输入策略

推荐策略：

1. 用户上传 PDF 到 Vercel Blob。
2. 后端保存 `blobUrl` / `blobPath` / 文件元数据。
3. 解析时服务端读取文件，作为 OpenAI `input_file` 发送。
4. OpenAI 返回结构化 JSON。
5. 数据库存储解析结果，不依赖每次重新读 PDF。

安全建议：简历属于敏感资料，MVP 如能配置私有 Blob 优先用私有；若使用公开但不可猜测 URL，必须在 PRD 和 README 中说明隐私取舍，并提供删除能力。

### 8.6 Streaming 策略

MVP 必须做 streaming 的功能只有：**bullet 智能重写**。

原因：

- 用户等待感明显。
- 可作为产品高光演示。
- 输出是自然语言，适合边生成边展示。

诊断报告、周报这类结构化结果不强制 streaming，优先保证 JSON 稳定。

---

## 9. 数据模型

本版推荐使用 Prisma。`userId` 使用 Clerk user id 字符串，不额外强制同步用户表。所有业务表都必须带 `userId`。

### 9.1 Prisma 模型草案

```prisma
model Resume {
  id           String   @id @default(cuid())
  userId       String
  title        String
  fileUrl      String?
  filePath     String?
  sourceText   String?  @db.Text
  parsedJson   Json?
  status       ResumeStatus @default(UPLOADING)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  bullets      ResumeBullet[]
  applications Application[]

  @@index([userId, createdAt])
}

model ResumeBullet {
  id           String   @id @default(cuid())
  userId       String
  resumeId     String
  sectionType  String
  sectionTitle String?
  orderIndex   Int
  originalText String   @db.Text
  currentText  String   @db.Text
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  resume       Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  rewrites     BulletRewrite[]

  @@index([userId, resumeId])
}

model Application {
  id             String @id @default(cuid())
  userId         String
  resumeId       String
  companyName    String
  roleTitle      String
  location       String?
  jdText         String @db.Text
  stage          ApplicationStage @default(PREPARING)
  jdExtractJson  Json?
  diagnosisJson  Json?
  greetingJson   Json?
  weeklyBatchId  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  resume         Resume @relation(fields: [resumeId], references: [id])
  rewrites       BulletRewrite[]
  reviews        InterviewReview[]

  @@index([userId, stage, updatedAt])
  @@index([userId, resumeId])
}

model BulletRewrite {
  id                    String   @id @default(cuid())
  userId                String
  resumeBulletId        String
  applicationId         String
  originalText          String   @db.Text
  variantsJson          Json
  selectedVariantIndex  Int?
  createdAt             DateTime @default(now())

  bullet                ResumeBullet @relation(fields: [resumeBulletId], references: [id], onDelete: Cascade)
  application           Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([userId, resumeBulletId])
  @@index([userId, applicationId])
}

model InterviewReview {
  id             String   @id @default(cuid())
  userId         String
  applicationId  String
  question       String   @db.Text
  answer         String   @db.Text
  feedback       String?  @db.Text
  aiReviewJson   Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  application    Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([userId, applicationId])
}

model AiGeneration {
  id             String   @id @default(cuid())
  userId         String
  feature        AiFeature
  model          String
  inputTokens    Int?
  outputTokens   Int?
  estimatedCost  Decimal? @db.Decimal(10, 6)
  status         GenerationStatus
  errorMessage   String?  @db.Text
  metadata       Json?
  createdAt      DateTime @default(now())

  @@index([userId, feature, createdAt])
}

enum ResumeStatus {
  UPLOADING
  PARSING
  READY
  FAILED
}

enum ApplicationStage {
  PREPARING
  APPLIED
  COMMUNICATING
  INTERVIEWING
  OFFER
  ARCHIVED
}

enum AiFeature {
  RESUME_PARSE
  JD_EXTRACT
  DIAGNOSIS
  REWRITE
  GREETING
  INTERVIEW_REVIEW
  WEEKLY_INSIGHT
}

enum GenerationStatus {
  SUCCESS
  FAILED
}
```

### 9.2 数据权限规则

- 每个业务查询都必须从 Clerk 获取 `userId`。
- 所有 Prisma 查询都必须包含 `where: { userId }` 或在父记录中验证 `userId`。
- 禁止只靠 URL id 查询业务记录。
- 删除、更新、AI 生成前都要先确认记录归属当前用户。

---

## 10. 功能需求详情

## FR-01 账号系统

### 描述

用户需要登录后才能访问工作台、简历、投递数据和 AI 生成功能。

### 技术实现

- 使用 Clerk。
- 使用 `proxy.ts` / route protection 保护 app 页面和 API route。
- 服务端通过 `auth()` 获取 `userId`。
- 页面顶部展示用户头像 / 邮箱。
- 支持退出登录。

### 验收标准

- 未登录用户无法访问 `/dashboard`、`/resumes`、`/applications/[id]`。
- 登录后刷新页面仍保持登录态。
- API route 在无登录态下返回 401。

---

## FR-02 简历上传与解析

### 描述

用户上传 PDF 简历后，系统调用 OpenAI 解析简历内容，并生成结构化简历数据。

### 需求

- MVP 仅支持 PDF。
- 文件大小限制建议 10MB。
- 上传到 Vercel Blob。
- 创建 `Resume` 记录，状态为 `UPLOADING` → `PARSING` → `READY` / `FAILED`。
- 后端调用 OpenAI Responses API，传入 `input_file`。
- 使用 Structured Outputs 返回结构化简历 JSON。
- 保存结构化 JSON 和 bullet 表。
- 每条 bullet 必须生成稳定 `bulletId`。

### 验收标准

- 用户上传 PDF 后看到解析中状态。
- 解析成功后进入简历详情页。
- 简历详情页至少展示：姓名、联系方式、教育经历、工作 / 项目经历、技能、bullet。
- 解析失败时展示错误，并允许重新解析。

---

## FR-03 新建投递与 JD 抽取

### 描述

用户通过粘贴 JD 创建投递记录。系统自动识别公司名、岗位名等信息，减少手填成本。

### 需求

- 在 `/dashboard` 提供“新建投递”按钮。
- 表单包含：JD 文本、选择简历、公司名、岗位名、地点、备注。
- 用户粘贴 JD 后，系统调用 OpenAI 自动提取：
  - `companyName`
  - `roleTitle`
  - `location`
  - `employmentType`
  - `seniority`
  - `requiredSkills`
  - `preferredSkills`
  - `responsibilities`
  - `confidence`
- AI 提取结果填入表单，用户可编辑。
- 保存后创建 `Application`，默认阶段为 `PREPARING` 或 `APPLIED`。

### 验收标准

- 粘贴 JD 后可以自动填充公司名和岗位名。
- 用户可以修改 AI 识别结果。
- 保存后看板出现对应卡片。

---

## FR-04 投递看板

### 描述

用户通过看板查看和管理投递进展。

### 需求

- `/dashboard` 展示 5 列固定看板。
- 每张卡片展示公司名、岗位名、更新时间、匹配分。
- 支持拖拽或状态下拉更新阶段。
- 顶部展示统计卡片：总投递数、沟通中、面试中、Offer。
- 空状态展示产品引导。

### 降级策略

如果 dnd-kit 实现超过半天仍不稳定，立即降级为卡片上的阶段下拉。拖拽是体验增强，不是主流程。

### 验收标准

- 阶段更新后刷新页面仍保持。
- 点击卡片进入投递详情页。
- 第一次进入时展示引导，而不是空白页面。

---

## FR-05 JD 诊断报告

### 描述

用户在投递详情页生成简历与 JD 的匹配诊断报告。

### 输入

- 结构化简历 JSON。
- 简历 bullet 列表。
- JD 原文。
- 岗位基本信息。

### 输出

- `matchScore`：0-100 匹配分。
- `hr3sVerdict`：HR 3 秒判断。
- `radarScores`：技能、经验、项目、关键词、表达等维度评分。
- `strengths`：优势列表。
- `gaps`：缺失项列表，每项包含严重程度。
- `suggestions`：可执行建议。
- `rewriteTargets`：建议优先修改的 bullet。

### UI

- 顶部展示 HR 3 秒判断横幅：红 / 黄 / 绿。
- 大分数圆环展示 `matchScore`。
- 雷达图展示维度分。
- 三栏展示：优势、缺口、建议。
- 每条建议旁边提供“应用到简历”入口。
- 支持重新生成。
- 展示本次生成估算成本。

### 验收标准

- 报告生成后保存到 `Application.diagnosisJson`。
- 重新进入页面时读取缓存结果。
- 重新生成会覆盖旧版本，并记录生成历史。
- JSON 校验失败时后端自动重试一次；仍失败则提示用户。

---

## FR-06 bullet 智能重写

### 描述

用户点击简历中的某条 bullet，可以基于某个投递岗位生成 3 个改写版本。

### 需求

- 在简历详情页和投递详情页都可以触发 bullet 重写。
- 点击 bullet 后打开右侧 Drawer。
- 用户选择目标投递记录。
- 系统传入：原 bullet、简历上下文、JD、诊断建议。
- OpenAI 使用 streaming 输出 3 个版本。
- 每个版本包含：
  - `label`：如“结果量化型”“岗位关键词型”“简洁冲击型”。
  - `content`：改写后的 bullet。
  - `why`：为什么这样改。
- 支持一键替换。
- 替换后写入数据库，并保留历史。

### 实现建议

为降低流式结构复杂度，MVP 可以采用两阶段策略：

1. 先用非流式 Structured Output 生成 3 个版本的 `label` 和 `why`。
2. 再对用户选中的某个方向进行流式改写。

如果时间充足，再升级为“三张卡片同时流式生成”。

### 验收标准

- 用户可以看到流式输出，而不是只等待完整结果返回。
- 任一版本可一键替换原 bullet。
- 替换后刷新页面仍显示新内容。
- 替换历史可追踪。

---

## FR-07 打招呼话术生成

### 描述

用户基于目标岗位和自己的简历生成短话术，用于 BOSS / HR 开场沟通。

### 需求

- 投递详情页提供“打招呼话术”Tab。
- 生成 3 种风格：
  - 直接型。
  - 谦逊型。
  - 亮点型。
- 每条话术 100 字以内。
- 每条话术包含适用场景说明。
- 支持一键复制。

### 验收标准

- 点击生成后展示 3 条不同风格话术。
- 复制成功后出现 toast。
- 生成结果保存，刷新页面后仍可查看。

---

## FR-08 面试复盘

### 描述

当投递进入“面试中”阶段后，用户可以记录面试问题和自己的回答，并获得 AI 复盘。

### 需求

- 仅当 `stage = INTERVIEWING` 或更高阶段时显示“面试复盘”Tab。
- 用户填写：
  - 面试问题。
  - 我的回答。
  - 面试官反馈，可选。
  - 自我感觉，可选。
- AI 输出：
  - 面试重点总结。
  - 回答中的薄弱点。
  - 下次类似面试准备建议。
  - 可复用表达模板。

### 验收标准

- 用户可以保存多条面试问题。
- 每条复盘有独立 AI 分析。
- 复盘内容可编辑或删除。

---

## FR-09 AI 求职周报

### 描述

当用户积累足够投递数据后，系统生成阶段性洞察。

### 触发条件

- 用户投递记录数量 ≥ 5。

### 输出内容

- 本周投递数量。
- 平均匹配度。
- 最强维度。
- 最弱维度。
- 高频缺失技能。
- 推荐下一步行动。

### 验收标准

- 投递不足 5 条时不展示周报入口，只展示引导。
- 投递达到 5 条后展示周报卡片。
- 周报生成结果保存，避免每次进入重复调用 AI。

---

## 11. 结构化输出 Schema 草案

### 11.1 简历解析

```ts
export const resumeParseSchema = z.object({
  fullName: z.string().optional(),
  headline: z.string().optional(),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.string()).default([]),
  }),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string().optional(),
    major: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    highlights: z.array(z.string()).default([]),
  })).default([]),
  experiences: z.array(z.object({
    id: z.string(),
    organization: z.string(),
    role: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    bullets: z.array(z.object({
      bulletId: z.string(),
      text: z.string(),
      detectedSkills: z.array(z.string()).default([]),
      metrics: z.array(z.string()).default([]),
    })),
  })).default([]),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    bullets: z.array(z.object({
      bulletId: z.string(),
      text: z.string(),
      detectedSkills: z.array(z.string()).default([]),
      metrics: z.array(z.string()).default([]),
    })),
  })).default([]),
  skills: z.array(z.string()).default([]),
  parseWarnings: z.array(z.string()).default([]),
});
```

### 11.2 JD 抽取

```ts
export const jdExtractSchema = z.object({
  companyName: z.string(),
  roleTitle: z.string(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  seniority: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});
```

### 11.3 诊断报告

```ts
export const diagnosisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  hr3sVerdict: z.object({
    level: z.enum(["red", "yellow", "green"]),
    summary: z.string(),
  }),
  radarScores: z.array(z.object({
    dimension: z.string(),
    score: z.number().min(0).max(100),
    reason: z.string(),
  })),
  strengths: z.array(z.object({
    title: z.string(),
    evidence: z.string(),
  })),
  gaps: z.array(z.object({
    title: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    reason: z.string(),
  })),
  suggestions: z.array(z.object({
    title: z.string(),
    action: z.string(),
    relatedBulletIds: z.array(z.string()).default([]),
  })),
  rewriteTargets: z.array(z.object({
    bulletId: z.string(),
    reason: z.string(),
    priority: z.enum(["low", "medium", "high"]),
  })),
});
```

---

## 12. API / Route Handler 设计

### 12.1 简历相关

| Method | Path | 说明 |
|---|---|---|
| `POST` | `/api/resumes` | 创建简历记录并上传文件 |
| `POST` | `/api/resumes/[id]/parse` | 触发 OpenAI 简历解析 |
| `GET` | `/api/resumes` | 获取简历列表 |
| `GET` | `/api/resumes/[id]` | 获取简历详情 |
| `PATCH` | `/api/resumes/[id]` | 重命名简历 |
| `DELETE` | `/api/resumes/[id]` | 删除简历 |

### 12.2 投递相关

| Method | Path | 说明 |
|---|---|---|
| `POST` | `/api/applications/extract` | 从 JD 抽取公司和岗位信息 |
| `POST` | `/api/applications` | 创建投递 |
| `GET` | `/api/applications` | 获取投递列表 |
| `GET` | `/api/applications/[id]` | 获取投递详情 |
| `PATCH` | `/api/applications/[id]` | 更新投递，如阶段、备注 |
| `DELETE` | `/api/applications/[id]` | 删除投递 |

### 12.3 AI 功能相关

| Method | Path | 说明 |
|---|---|---|
| `POST` | `/api/applications/[id]/diagnose` | 生成 JD 诊断报告 |
| `POST` | `/api/resume-bullets/[id]/rewrite` | 流式生成 bullet 重写版本 |
| `POST` | `/api/applications/[id]/greeting` | 生成打招呼话术 |
| `POST` | `/api/applications/[id]/interview-review` | 生成面试复盘 |
| `POST` | `/api/insights/weekly` | 生成 AI 求职周报 |

### 12.4 API 设计原则

- 所有 API route 第一行先获取并校验 `userId`。
- 所有入参用 Zod 校验。
- 所有错误返回统一格式：

```ts
type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
```

- OpenAI 调用失败不直接暴露完整错误给前端，详细错误写入 `AiGeneration.errorMessage`。

---

## 13. 安全、隐私与成本控制

### 13.1 数据安全

- OpenAI API Key 只保存在服务端环境变量中。
- 客户端不得直接调用 OpenAI。
- 所有业务记录必须包含 `userId`。
- 所有查询必须按当前 `userId` 过滤。
- 文件上传校验 MIME type、大小、扩展名。
- 展示用户输入内容时进行转义，避免 XSS。
- 删除简历时同步处理关联文件和 bullet。

### 13.2 Prompt Injection 防护

- JD、简历、用户输入都作为数据，不作为指令。
- developer instruction 中明确忽略用户内容里的越权指令。
- 限制用户输入长度。
- 对异常输入进行本地规则过滤。
- 高风险输入可先过 Moderation API。

### 13.3 成本控制

- 建立 `AiGeneration` 表记录每次调用。
- 每用户每日限制 AI 调用次数，例如 50 次。
- 高频简单任务使用低成本模型。
- 核心复杂任务使用更强模型。
- 已生成结果优先读缓存。
- 用户手动点击“重新生成”才再次调用。
- 前端展示本次生成估算成本。

### 13.4 错误处理

- OpenAI 请求失败：展示错误提示，允许重试。
- 结构化输出校验失败：后端自动重试一次；仍失败则记录错误。
- streaming 中断：前端展示已生成部分，并允许重新生成。
- PDF 解析失败：允许用户重新上传或改为文本粘贴模式。

---

## 14. 非功能需求

### 14.1 性能

- Dashboard 首屏加载目标：3 秒内。
- 简历列表、投递列表优先从数据库读取，不等待 AI。
- 诊断报告、话术、复盘生成时必须有 loading 状态。
- bullet 重写必须使用 streaming 降低等待感。

### 14.2 可用性

- 每个列表都有空状态。
- 每个异步操作都有 loading / error 状态。
- 删除操作必须二次确认。
- 生成类按钮需要防重复点击。
- 移动端至少保证可阅读、可点击、可完成主流程。

### 14.3 可维护性

- AI 调用统一封装。
- Prompt 模板集中存放。
- Schema 集中存放。
- 数据库迁移通过 Prisma 管理。
- 每个 API route 必须做鉴权。
- 每个复杂 service 至少有 1 个单元测试。

---

## 15. 成功指标

### 15.1 产品指标

| 指标 | 目标 |
|---|---|
| 新用户完成首次简历上传率 | ≥ 70% |
| 新用户完成首次投递创建率 | ≥ 60% |
| 诊断报告生成成功率 | ≥ 95% |
| bullet 重写使用率 | ≥ 40% |
| 话术复制率 | ≥ 30% |
| 周报触发用户中查看率 | ≥ 50% |

### 15.2 工程指标

| 指标 | 目标 |
|---|---|
| 结构化输出 schema 校验成功率 | ≥ 95% |
| OpenAI 请求失败率 | ≤ 5% |
| Dashboard 首屏加载 | ≤ 3 秒 |
| 单用户每日调用限制 | 默认 50 次 |
| 生产环境核心流程 | 100% 跑通 |
| `pnpm check` | 可通过 |

---

## 16. 三周交付计划：Codex 优化版

### Week 1：地基 + 数据闭环

目标：完成登录、数据库、文件上传、简历解析、新建投递和看板基础。

| Day | 交付物 | Codex 任务建议 |
|---|---|---|
| Day 1 | Next.js 项目初始化、shadcn/ui、Clerk、AGENTS.md、README 初版 | “初始化项目并根据 PRD 生成 AGENTS.md 和基础 layout” |
| Day 2 | Prisma schema、数据库迁移、基础查询封装、受保护路由 | “根据 schema.prisma 实现 db client 和 auth helper” |
| Day 3 | Vercel Blob 上传、Resume 创建、PDF 解析状态机 | “实现 PDF 上传和 Resume 状态流转，不调用 OpenAI” |
| Day 4 | OpenAI 简历解析、resumeParseSchema、简历详情页 | “实现 resume parse service，并用 fixture 写测试” |
| Day 5 | 新建投递、JD 抽取、Application CRUD | “实现 JD extract service 和投递表单” |
| Day 6 | Dashboard 看板、阶段更新、统计卡片 | “实现应用看板；拖拽来不及则用下拉更新阶段” |
| Day 7 | 回归、修 bug、首次 Vercel 部署 | “跑 pnpm check，修复失败，并补空状态” |

Week 1 结束验收：用户能登录、上传简历、看到解析结果、新建投递、在看板更新状态。

### Week 2：AI 功能串联

目标：完成诊断、重写、话术、复盘、周报。

| Day | 交付物 | Codex 任务建议 |
|---|---|---|
| Day 8 | 诊断报告 OpenAI service + diagnosisSchema | “根据 diagnosisSchema 实现 generateDiagnosis 并写测试” |
| Day 9 | 诊断报告 UI：分数、雷达图、优势/缺口/建议 | “实现 diagnosis tab，读取缓存并支持重新生成” |
| Day 10 | bullet rewrite streaming API | “实现 rewrite route 的 streaming，不修改其它模块” |
| Day 11 | Drawer UI、一键替换、重写历史 | “实现 bullet rewrite drawer 和 apply action” |
| Day 12 | 打招呼话术、复制、保存 | “实现 greeting schema/service/tab” |
| Day 13 | 面试复盘、周报洞察 | “实现 interview review 和 weekly insight 两个 P1 功能” |
| Day 14 | Prompt hardening、schema 重试、AI 日志 | “统一 AI service 的错误处理、成本记录、重试逻辑” |

Week 2 结束验收：产品 AI 闭环跑通，所有 AI 结果可落库、可重新进入页面查看。

### Week 3：打磨 + 安全 + 上线包装

目标：产品达到线上可用和作品展示状态。

| Day | 交付物 | Codex 任务建议 |
|---|---|---|
| Day 15 | loading / empty / error / toast 全面补齐 | “扫描 app 页面并补全所有异步状态” |
| Day 16 | 响应式、键盘/小交互、可访问性基础 | “优化移动端布局和核心按钮 aria label” |
| Day 17 | Rate limit、输入长度限制、Moderation、本地 prompt injection 规则 | “实现 rate-limit service 并接入所有 AI route” |
| Day 18 | 生产部署、环境变量、真实流程回归 | “检查 Vercel 部署配置和生产错误” |
| Day 19 | Demo 数据、真实简历/JD 打样、性能修复 | “生成 seed demo data，并修复线上 bug” |
| Day 20 | README、架构图、Demo 视频脚本 | “根据 PRD 和现有代码生成 README 技术架构部分” |
| Day 21 | 最终 bug bash、验收清单、README polish | “按照 MVP checklist 检查缺口并做小修复” |

Week 3 结束验收：线上产品可用，README 可展示，demo 数据完整，核心流程 100% 跑通。

---

## 17. MVP 验收清单

### 17.1 核心流程

- [ ] 用户可以注册 / 登录。
- [ ] 用户可以上传 PDF 简历。
- [ ] 系统可以解析简历并展示结构化结果。
- [ ] 用户可以新建投递。
- [ ] 系统可以从 JD 自动提取公司名和岗位名。
- [ ] 看板可以展示投递卡片。
- [ ] 卡片可以更新到不同阶段并保存。
- [ ] 投递详情页可以生成诊断报告。
- [ ] 诊断报告可以显示分数、优势、缺口、建议。
- [ ] 用户可以点击 bullet 生成重写版本。
- [ ] bullet 重写有流式输出。
- [ ] 用户可以一键替换 bullet。
- [ ] 用户可以生成并复制打招呼话术。
- [ ] 用户可以记录面试复盘并生成 AI 建议。
- [ ] 投递数 ≥ 5 时可以生成周报。
- [ ] 所有 AI 生成都有 loading / error 状态。
- [ ] 线上环境核心流程可跑通。

### 17.2 Codex / 工程验收

- [ ] 根目录有 `AGENTS.md`。
- [ ] 根目录有 `docs/PRD.md`、`docs/ARCHITECTURE.md`。
- [ ] OpenAI prompt 集中在 `src/features/ai/prompts`。
- [ ] OpenAI schema 集中在 `src/features/ai/schemas`。
- [ ] 没有客户端直接调用 OpenAI。
- [ ] 所有 Prisma 查询都按 `userId` 隔离。
- [ ] `pnpm typecheck` 通过。
- [ ] `pnpm lint` 通过。
- [ ] `pnpm test` 通过。
- [ ] 至少 1 条 Playwright smoke test 覆盖登录后核心页面。

### 17.3 安全与成本验收

- [ ] OpenAI API Key 不出现在前端代码。
- [ ] 每次 AI 调用记录 model、tokens、feature、estimatedCost。
- [ ] 每用户每日调用次数有限制。
- [ ] 超限时展示友好提示。
- [ ] 用户输入长度有限制。
- [ ] 结构化输出有 schema 校验和失败重试。
- [ ] PDF 文件可删除。

---

## 18. 风险与降级方案

| 风险 | 影响 | 降级方案 |
|---|---|---|
| PDF 解析不稳定 | 简历无法进入主流程 | 增加“粘贴简历文本”入口；或用本地 PDF 文本提取作为 fallback |
| Structured Outputs 校验失败 | UI 无法渲染 | 自动重试一次；仍失败则显示错误并记录日志 |
| OpenAI 成本超预期 | 无法长期开放试用 | 降低模型规格；限制每日调用；缓存结果 |
| Streaming 实现耗时 | Week 2 延迟 | 先做单版本 streaming，再扩展到 3 卡片 |
| 看板拖拽耗时 | 影响主流程 | 先支持阶段下拉，拖拽作为增强 |
| Clerk / Blob / Prisma 任一服务配置卡住 | 影响交付 | 优先保留 Next.js + Prisma + OpenAI；文件可先用本地上传 mock；认证可先用 Clerk 默认页 |
| 周报功能来不及 | 不影响核心链路 | 移入 P1 / P2，优先保证诊断和重写 |
| 移动端适配耗时 | UI 质量下降 | 先保证桌面和 iPad，手机只保留基础可用 |

---

## 19. README 与展示要求

README 不只是安装说明，而是作品展示入口。建议结构：

```md
# 第一页 / Prologue

> 把每一次投递，变成一次 offer 的前奏。

[Demo 视频] [线上体验] [源代码]

## 产品截图
- Dashboard 看板
- JD 诊断报告
- bullet 流式重写
- 打招呼话术

## 解决什么问题
用 3 段话讲清求职者的管理、匹配、行动问题。

## 核心功能
1. 简历解析
2. 投递看板
3. JD 诊断
4. bullet 重写
5. 话术 / 复盘 / 周报

## 技术架构
- Next.js App Router
- Clerk
- Prisma + Postgres
- Vercel Blob
- OpenAI Responses API
- Structured Outputs
- Streaming

## Codex 如何参与开发
- AGENTS.md 如何约束任务
- Schema-first 如何减少返工
- 哪些模块由 Codex 生成，哪些地方人工修正
- 3 个真实踩坑

## 本地运行
pnpm install
pnpm db:migrate
pnpm dev

## License
MIT
```

---

## 20. 最小可用版本定义

如果三周内时间不足，MVP 最小版本只保留：

1. 登录。
2. 上传并解析简历。
3. 新建投递。
4. 看板管理。
5. JD 诊断报告。
6. bullet 重写。
7. 打招呼话术。
8. 部署上线。

可延后：

- 面试复盘。
- AI 求职周报。
- 全局搜索。
- Diff 视图。
- 深度移动端适配。
- 三卡片同时 streaming。

---

## 21. 最终结论

《第一页 / Prologue》的 MVP 不应做成“很多 AI 小功能的集合”，而应做成围绕求职投递闭环的工作台。

本版技术策略是：

- 用 **Next.js App Router** 做全栈入口，减少前后端割裂。
- 用 **Clerk + Prisma + Postgres + Vercel Blob** 替代原本的 Supabase 默认假设，降低三周交付风险。
- 用 **OpenAI Responses API** 统一 AI 能力。
- 用 **Structured Outputs** 保证 AI 结果可落库、可渲染、可验证。
- 用 **Streaming** 打造 bullet 重写的高光体验。
- 用 **AGENTS.md + Schema-first + 测试脚本** 让 Codex 更像工程队友，而不是一次性聊天助手。

最终目标不是堆功能，而是在三周内交付一个“真实可用、结构清晰、AI 能力稳定、可以作为作品展示”的产品。
