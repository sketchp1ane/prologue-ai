# DEVLOG

## 2026-04-25 — Repository initialization

Initialized the Prologue / 第一页 repository scaffold.

Included:

- Next.js App Router skeleton
- TypeScript strict configuration
- Tailwind CSS base setup
- Codex project instructions
- MCP configuration
- Codex skills
- docs as source of truth
- environment template
- CI workflow
- validation scripts

Not included:

- product UI
- v0 homepage implementation
- authentication
- database models
- OpenAI API calls
- upload flow
- dashboard logic

Next recommended task: read `docs/05_CODEX_TASKS.md` and start from the first unfinished task.

## 2026-04-25 — Scaffold verification and Git workflow

Verified the initialization scaffold and documented the repository GitHub Flow.

Included:

- Dependency installation with a generated `pnpm-lock.yaml`
- Valid package manager and Vercel Blob dependency pins
- Next.js 16-compatible ESLint flat config
- TypeScript config cleanup for current Next.js and TypeScript behavior
- GitHub Actions pnpm version alignment
- Git workflow and commit message standards in `docs/13_GIT_WORKFLOW.md`

Validation:

- `pnpm check` passed
- `pnpm db:generate` passed

Not included:

- product UI
- v0 homepage implementation
- authentication
- database models
- OpenAI API calls
- upload flow
- dashboard logic

## 2026-04-25 — v0 homepage import

Imported the v0-generated homepage prototype as the public landing page.

Included:

- Static landing page composition in `app/page.tsx`
- Landing components under `components/landing/`
- The single required shadcn-style `Button` component
- Tailwind v4 theme tokens for the homepage visual system
- Homepage metadata update without v0 generator metadata

Not included:

- auth route implementation
- dashboard routes
- database logic
- OpenAI API calls
- Vercel analytics
- v0 generated config files

## 2026-04-26 — Root hydration warning guard

Added a targeted hydration-warning guard to the root `<body>` element.

Included:

- `suppressHydrationWarning` on `app/layout.tsx` body to tolerate browser extensions that inject attributes before React hydrates

Not included:

- product UI changes
- auth logic
- database logic
- OpenAI API calls

## 2026-04-27 — Static app shell placeholders

Implemented the first static authenticated-workspace shell placeholders.

Included:

- Route-group layout for future app pages under `app/(app)/`
- Left sidebar navigation for Dashboard, Resumes, Applications, Interviews, and Settings
- Static topbar with product name and placeholder user area
- Reusable monochrome empty-state component
- Placeholder pages for `/dashboard`, `/resumes`, `/applications`, `/interviews`, and `/settings`
- Unit coverage for the initial workspace route list

Not included:

- Real authentication
- Clerk wiring
- database models
- OpenAI API calls
- resume upload
- application tracking logic

## 2026-04-27 — Clerk authentication integration

Implemented the Clerk-only foundation slice for the workspace.

Included:

- Root `ClerkProvider` wiring
- Public `/sign-in` and `/sign-up` Clerk pages
- Clerk route protection for `/dashboard`, `/resumes`, `/applications`, `/interviews`, and `/settings`
- Authenticated topbar user area using Clerk user data and `UserButton`
- Server-side current user id helper under `src/lib/auth/`
- Clerk route environment variables in `.env.example`
- Unit coverage for auth route/env configuration

Not included:

- database models
- Prisma repositories
- OpenAI API calls
- resume upload
- real dashboard data

## 2026-04-27 — Clerk local fallback and docs sync

Hardened the foundation auth slice so public routes remain accessible during local setup.

Included:

- Clerk proxy fallback when Clerk environment variables are missing
- Local setup notices on `/sign-in` and `/sign-up` instead of runtime Clerk errors
- Protected workspace redirect to `/sign-in` when Clerk is not configured
- README and current-state documentation updates for the actual foundation state
- Unit coverage for the Clerk fallback behavior

Not included:

- database models
- Prisma repositories
- OpenAI API calls
- resume upload
- real dashboard data

## 2026-04-27 — Initial Prisma data model

Implemented the data-model-only foundation slice.

Included:

- Prisma models for resumes, resume bullets, applications, bullet rewrites, interview reviews, and AI generation audit rows
- Enums for resume status, application stage, AI feature type, and generation status
- User-scoped indexes for future Clerk-owned data access
- Development-safe Prisma client helper under `src/lib/db/`
- Ownership helper stubs for resumes and applications
- Unit coverage for ownership helper query shape and failure behavior

Not included:

- Database migration execution
- UI or CRUD pages
- OpenAI API calls
- resume upload
- application tracking logic

## 2026-04-27 — CI Prisma generation fix

Fixed the CI validation command after adding Prisma models.

Included:

- `pnpm check` now runs Prisma Client generation before typecheck, lint, tests, and build

Not included:

- Database migration execution
- schema changes

## 2026-04-27 — Resume pasted-text slice

Implemented the first resume management vertical slice.

Included:

- User-scoped resume repository and service functions
- Pasted-text resume creation at `/resumes/new`
- Real resume list at `/resumes` with empty state
- Resume detail page at `/resumes/[id]`
- Rename and delete server actions
- Initial Prisma migration for the existing schema
- Unit coverage for resume validation and user-scoped query shapes

Not included:

- PDF upload
- OpenAI calls
- Resume parsing
- Application features
- Homepage changes

## 2026-04-27 — Vercel Prisma build fix

Fixed the Vercel production build after adding Prisma models.

Included:

- `pnpm build` now generates Prisma Client before `next build`
- Vercel can typecheck imports from `@prisma/client` during deployment

Not included:

- schema changes
- database migration execution
