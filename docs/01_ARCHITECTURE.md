# 01 — Architecture

## Current stage

This repository is initialized only. The architecture described here is the target for subsequent Codex tasks.

## Architecture principle

This is a 3-week Codex-built MVP. Prefer simple, typed, inspectable modules over clever abstractions.

## Recommended stack

```txt
Next.js App Router
TypeScript strict
Tailwind CSS + shadcn/ui
Clerk Auth
Prisma + Postgres
Vercel Blob / object storage
OpenAI TypeScript SDK
Zod
Vitest
Playwright
Vercel
```

## Boundary rules

- Client components render UI and collect input.
- Server actions / route handlers enforce auth and call services.
- Services own business logic.
- Prisma access is centralized in repository modules.
- OpenAI SDK calls are centralized in `src/lib/ai/`.
- Storage calls are centralized in `src/lib/storage/`.

## Planned routes

```txt
/                         public homepage, imported later from v0 prototype
/dashboard                application board
/resumes                  resume list
/resumes/new              upload or paste resume
/resumes/[id]             resume detail
/applications/[id]        application detail
/settings                 model/cost preferences
```

## Planned API routes

```txt
POST /api/resumes/parse
POST /api/jd/extract
POST /api/applications/[id]/diagnose
POST /api/resume/rewrite-bullet
POST /api/applications/[id]/outreach
POST /api/applications/[id]/interview-review
POST /api/reports/weekly
```

## Deployment

- Main app: Vercel
- Database: managed Postgres
- File storage: Vercel Blob or equivalent
- Secrets: deployment environment variables only
