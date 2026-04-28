# Prologue / 第一页

> AI job-search workspace. Turn every application into a repeatable path toward an offer.

This repository is currently at the **workspace data v1 stage**. It contains the engineering scaffold, project documentation, Codex configuration, MCP configuration, skills, CI, environment templates, the public homepage, Clerk-backed workspace routes, Prisma data models, pasted-text Resume CRUD, Application creation/detail flows, JD extraction, resume-to-application attachment, and a real user-scoped dashboard board.

Resume upload, Resume Parse, Diagnosis, Bullet Rewrite, Outreach, Interview Review, Weekly Report, rate limiting, and deployment hardening are still pending.

## Current status

```txt
Stage: workspace data v1
UI implemented: public homepage, auth pages, workspace shell, resumes, applications, dashboard board
Business logic implemented: pasted-text resumes, applications, stage updates, resume attachment
Auth implemented: Clerk foundation routes and protected workspace shell
OpenAI API implemented: JD Extract only
Database models implemented: initial MVP Prisma schema with migrations
Ready for Codex task execution: yes
```

The next recommended product slice is Resume Parse from `docs/05_CODEX_TASKS.md`. Keep it separate from Diagnosis, Bullet Rewrite, Outreach, Interview Review, and Weekly Report.

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

The public homepage is available at `/`. Clerk-backed auth pages are available at `/sign-in` and `/sign-up`. Protected workspace routes live under `/dashboard`, `/resumes`, `/applications`, `/jd-extract`, and placeholder settings/product routes.

If Clerk environment variables are missing, public pages still load with a setup notice and protected workspace routes redirect to `/sign-in`. JD Extract also requires `OPENAI_API_KEY` and model configuration from `.env.example`.

## Validation commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check
```

Run `pnpm install` before validation if dependencies are not already installed.

## Codex handoff

Useful first prompt for a fresh Codex session:

```txt
Read AGENTS.md and all docs in the docs/ directory. Summarize the project goal, current state, active constraints, MCP servers, skills, and the next three tasks. Do not modify files.
```

Then continue with the next unfinished product task in `docs/05_CODEX_TASKS.md`.
