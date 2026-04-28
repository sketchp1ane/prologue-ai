# 01 — Architecture

## Current stage

The repository has moved beyond initialization into the Workspace Data v1 stage. The architecture below is both the current implementation baseline and the target pattern for future slices.

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

## Current routes

```txt
/                         public homepage
/sign-in                  Clerk sign-in preview/fallback route
/sign-up                  Clerk sign-up preview/fallback route
/dashboard                current-user application board with stage columns
/resumes                  current-user resume list
/resumes/new              pasted-text resume creation
/resumes/[id]             current-user resume detail, rename, delete
/applications             current-user application list
/applications/new         pasted-JD application creation with optional resume attachment
/applications/[id]        current-user application detail, stage update, resume attach/detach
/jd-extract               authenticated JD extraction utility page
/settings                 placeholder
/analytics                placeholder
/billing                  placeholder
/candidates               placeholder
/interviews               placeholder
```

## Current API routes

```txt
POST /api/applications/extract-jd
```

## Planned API routes

```txt
POST /api/resumes/parse
POST /api/applications/[id]/diagnose
POST /api/resume/rewrite-bullet
POST /api/applications/[id]/outreach
POST /api/applications/[id]/interview-review
POST /api/reports/weekly
```

## Current module boundaries

```txt
components/app/                 shared authenticated shell primitives
components/applications/        board, stage badge/select, resume select
components/landing/             static homepage visual baseline
src/lib/auth/                   Clerk user helpers
src/lib/db/                     Prisma client and user-scoped repositories
src/lib/resumes/                resume service logic
src/lib/applications/           application service logic and stage metadata
src/lib/ai/                     OpenAI client, model routing, prompts, schemas, services
src/lib/validations/            Zod input schemas for server actions and services
```

## Deployment

- Main app: Vercel
- Database: managed Postgres
- File storage: Vercel Blob or equivalent
- Secrets: deployment environment variables only
