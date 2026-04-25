# AGENTS.md — Prologue / 第一页

## Project mission

Build **Prologue / 第一页**, an AI job-search workspace for individual job seekers.

The product should help users manage applications, parse resumes, compare resumes with job descriptions, rewrite resume bullets, generate outreach messages, review interviews, and produce weekly job-search insights.

This repository is optimized for **Codex-driven full-cycle development**. The source of truth is in `docs/`.

## Current repository stage

This repository is currently initialized only.

Do not assume product features exist yet.
Do not implement features unless the current task explicitly asks for them.
Do not import the v0 homepage prototype unless the task explicitly says to integrate the homepage.

## Default stack

Use this stack unless a task explicitly changes it:

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui / Radix UI style components
- Clerk for authentication
- Prisma + Postgres
- Vercel Blob or equivalent object storage for uploaded resume PDFs
- OpenAI TypeScript SDK
- Zod for schema-first validation
- Vitest for unit tests
- Playwright for critical smoke tests
- Vercel deployment

## Non-negotiable rules

1. Do not use Anthropic, Claude SDK, Gemini SDK, or non-OpenAI model providers in app code.
2. All OpenAI API calls must go through `src/lib/ai/` service modules.
3. For JSON-producing AI features, define a Zod schema first, then use OpenAI structured output capabilities or an equivalent schema-backed approach.
4. Do not call OpenAI from React client components.
5. Do not log full resumes, full JDs, generated private content, or secrets.
6. Do not commit `.env.local` or any real secret.
7. Do not run destructive database operations without explicit user approval.
8. Every user-owned database record must be scoped by `userId`.
9. Every feature slice must include at least one validation path: unit test, integration test, smoke test, or documented manual QA.
10. Run `pnpm check` before declaring work complete.
11. When working with OpenAI API, Codex, or MCP details, consult the OpenAI developer documentation MCP server first.
12. Prefer small vertical slices over broad rewrites.

## Repository reading order for every new task

1. `docs/11_CURRENT_STATE.md`
2. `docs/00_PROJECT_BRIEF.md`
3. `docs/01_ARCHITECTURE.md`
4. `docs/02_OPENAI_API_CONTRACTS.md`
5. `docs/03_DATA_MODEL.md`
6. `docs/04_ACCEPTANCE_CRITERIA.md`
7. `docs/05_CODEX_TASKS.md`
8. Task-specific docs, if any

## Expected project structure

```txt
app/
  layout.tsx
  page.tsx
components/
  ui/
  landing/
src/
  lib/
    ai/
      prompts/
      schemas/
      services/
    auth/
    db/
    storage/
    rate-limit/
    validations/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  e2e/
docs/
```

## Implementation protocol

For each task:

1. Restate the exact feature slice you are implementing.
2. Inspect existing files before editing.
3. Update or create schemas before API routes.
4. Add server/service code before UI wiring.
5. Add loading, empty, and error states for any async UI.
6. Add tests or document manual QA.
7. Run:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
8. If a command cannot run, document the exact reason.
9. Update `DEVLOG.md` after each meaningful slice.

## Quality bar

A feature is complete only when:

- It is reachable from the intended route or documented entrypoint.
- It persists the correct data, if persistence is part of the task.
- It handles loading, empty, and error states.
- It does not leak data across users.
- It has a clear fallback for AI failure, if AI is part of the task.
- It passes `pnpm check`, or the failure is explicitly documented.

## AI feature rules

### Resume parsing

- Accept PDF upload and pasted text fallback.
- Store raw source text if available.
- Store structured JSON that matches the resume schema.
- If PDF parsing fails, ask the user to paste text rather than hallucinating.

### JD extraction

- Extract company name, role title, location, seniority, required skills, preferred skills, responsibilities, and keywords.
- Never invent company facts not present in the JD.

### Diagnosis report

- Compare one resume with one JD.
- Return score, HR 3-second verdict, strengths, gaps, risks, recommended actions, and bullet-level suggestions.
- Store the report so the user can revisit it.

### Bullet rewriting

- Stream or progressively display three rewrite variants.
- Each variant must include rewritten bullet, strategy label, and rationale.
- Preserve truthfulness; do not fabricate metrics.

### Weekly report

- Use accumulated application data.
- If data is insufficient, show deterministic statistics and skip AI narrative.

## UI rules

- The v0 homepage prototype is a visual reference only until a task explicitly imports it.
- Prefer simple, shippable UI over complex interactions.
- Kanban drag-and-drop is optional; a stage dropdown is an acceptable fallback.
- Every page must have a useful empty state.
- Use accessible labels for forms and buttons.
- Do not block the MVP on animation polish.

## Security and privacy

- Treat resumes and JDs as private user data.
- Do not log raw resume content or full JDs.
- Sanitize user-generated content before rendering.
- Add per-user rate limits for AI endpoints.
- Store AI usage metadata for cost visibility.

## Commit style

Use conventional commits:

- `chore: initialize project`
- `feat: add resume parser`
- `fix: handle diagnosis schema validation`
- `test: add application board smoke test`

## When blocked

Do not guess silently. Update `docs/09_RISKS_AND_DECISIONS.md` with:

- Blocker
- Options considered
- Recommended choice
- Temporary fallback
