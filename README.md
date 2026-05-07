# Prologue / 第一页

> AI job-search workspace. Turn every application into a repeatable path toward an offer.

This repository is currently at the **workspace data v1 stage**. It contains the engineering scaffold, project documentation, Codex configuration, MCP configuration, skills, CI, environment templates, the public homepage, Clerk-backed workspace routes, Prisma data models, pasted-text and PDF Resume creation, Resume Parse v1, Application creation/detail flows, JD extraction, resume-to-application attachment, and a real user-scoped dashboard board.

Diagnosis, Bullet Rewrite, Outreach, Interview Review, Weekly Report, rate limiting, and deployment hardening are still pending.

## Current status

```txt
Stage: workspace data v1
UI implemented: public homepage, auth pages, workspace shell, resumes, applications, dashboard board
Business logic implemented: pasted-text/PDF resumes, Resume Parse, applications, stage updates, resume attachment
Auth implemented: Clerk foundation routes and protected workspace shell
OpenAI API implemented: JD Extract, Resume Parse from pasted text and PDF file input
Database models implemented: initial MVP Prisma schema with migrations
Ready for Codex task execution: yes
```

The next recommended product slice is Diagnosis from `docs/05_CODEX_TASKS.md`. Keep it separate from Bullet Rewrite, Outreach, Interview Review, and Weekly Report.

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

If Clerk environment variables are missing, public pages still load with a setup notice and protected workspace routes redirect to `/sign-in`. JD Extract and Resume Parse require `OPENAI_API_KEY` and model configuration from `.env.example`; PDF upload also requires `BLOB_READ_WRITE_TOKEN`.

For local browser QA with Clerk, create a dedicated user in your Clerk development instance, copy its `user_id` into `CLERK_TEST_USER_ID` in `.env.local`, then run:

```bash
pnpm dev:clerk-login -- --next=/applications
```

Open the printed one-time URL in the browser. The `/dev/clerk-ticket` page is development-only, consumes the Clerk sign-in token, and redirects to the requested local path.

PDF privacy note: uploaded PDFs are stored privately in Vercel Blob. When parsing is triggered, the server sends the PDF to OpenAI as a file input; OpenAI may scan file inputs for safety and PDF parsing can use more tokens than pasted text. If PDF parsing fails, create a pasted-text resume version as the fallback.

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
