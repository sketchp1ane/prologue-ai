# Prologue / 第一页

> AI job-search workspace. Turn every application into a repeatable path toward an offer.

This repository is currently at the **initialization stage**. It intentionally contains only the engineering scaffold, project documentation, Codex configuration, MCP configuration, skills, CI, and environment templates.

No product feature, real business flow, authentication flow, database model, OpenAI API route, upload flow, dashboard, or landing page UI is implemented in this initial commit.

## Current status

```txt
Stage: initialization only
UI implemented: no
Business logic implemented: no
OpenAI API implemented: no
Database models implemented: no
Ready for Codex task execution: yes
```

The next development step is to let Codex read `AGENTS.md` and `docs/`, then continue from `docs/05_CODEX_TASKS.md`.

## Planned product

Prologue / 第一页 is an AI-powered workspace for individual job seekers. The MVP is planned to support:

- resume upload or pasted resume text
- resume parsing
- application tracking
- job-description extraction
- resume-vs-JD diagnosis
- resume bullet rewriting
- outreach message generation
- interview review
- weekly job-search insights

See:

- `docs/PRD.md`
- `docs/PLAN_3W.md`
- `docs/00_PROJECT_BRIEF.md`

## Recommended stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui / Radix UI style component conventions
- Clerk
- Prisma + Postgres
- Vercel Blob
- OpenAI TypeScript SDK
- Zod
- Vitest
- Playwright smoke tests
- Vercel deployment

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app currently renders a blank placeholder page by design. It is not expected to show the v0 homepage prototype at this stage.

## Validation commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check
```

Because this generated zip does not include `node_modules`, run `pnpm install` before validation.

## Codex handoff

First prompt to Codex after pushing this repository:

```txt
Read AGENTS.md and all docs in the docs/ directory. Summarize the project goal, current state, active constraints, MCP servers, skills, and the next three tasks. Do not modify files.
```

Then continue with the first unfinished task in `docs/05_CODEX_TASKS.md`.

## GitHub initial push

```bash
git init
git add .
git commit -m "chore: initialize Prologue project"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
