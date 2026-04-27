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
