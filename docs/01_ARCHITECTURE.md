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

## Internationalization

- Workspace UI supports English (`en`) and Simplified Chinese (`zh-CN`) without locale-prefixed routes.
- The current locale is read from the current user's `UserPreference` record, with English as the default.
- A `prologue-locale` cookie mirrors the saved preference for first paint and root `<html lang>`.
- Shared UI copy and future feature copy should be added to `src/lib/i18n/dictionaries.ts` before wiring UI.
- Authenticated workspace pages and client components receive serializable dictionary slices or final strings; dictionaries must not contain functions.
- User-provided resumes, JDs, company names, role titles, and extracted facts stay in their source language unless translation is explicitly requested.
- Future AI generation services should accept the current locale and use `src/lib/i18n/ai.ts` for output-language instructions.

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
POST /api/resumes/[id]/parse
```

## Planned API routes

```txt
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
src/lib/i18n/                   locale config, dictionaries, server locale helpers, AI language instruction
src/lib/user-preferences/       user preference service and settings form parsing
src/lib/validations/            Zod input schemas for server actions and services
```

## Deployment

- Main app: Vercel
- Database: managed Postgres
- File storage: Vercel Blob or equivalent
- Secrets: deployment environment variables only
