# DEVLOG

## 2026-05-03 — OpenAI resume parse service

Implemented the server-only Resume Parse service without adding UI, routes, PDF
upload, diagnosis, bullet rewrite, or homepage changes.

Included:

- Added `OPENAI_MODEL_PARSE` model routing and `.env.example` documentation
- Added `parseResumeFromText` under `src/lib/ai/services/` using the existing
  OpenAI Responses API structured-output pattern
- Validated user, resume id, and pasted resume text before any OpenAI call
- Checked resume ownership before linking an `AiGeneration` row
- Sent private resume parse requests with `store: false`
- Recorded success/failure `AiGeneration` rows for `RESUME_PARSE` with model,
  prompt version, input hash, safe length metadata, usage JSON, and token counts
  when available
- Added service unit tests for input limits, model/API-key configuration errors,
  ownership checks, success logging, schema failure logging, and privacy-safe
  audit data

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 15 test files, 58 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-04-29 — Dashboard database-unavailable fallback

Fixed the dashboard runtime crash when Prisma cannot reach the configured
database.

Included:

- Added a typed Prisma client initialization error guard
- Updated `/dashboard` to render a safe database-unavailable state for
  transient or misconfigured database connections
- Preserved current-user scoping and avoided logging private resume or JD
  content
- Added unit coverage for the Prisma initialization error guard

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `pnpm test` passed: 13 test files, 49 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-04-28 — End-of-day documentation maintenance

Synchronized source-of-truth docs after updating local `main`.

Included:

- Updated README current status from foundation-only to Workspace Data v1
- Refreshed architecture, data model, OpenAI contract, acceptance, task queue, current state, and risk docs to match implemented slices
- Rebuilt the tracked file manifest
- Kept this as a docs-only maintenance branch

Validation:

- `pnpm check` passed

## 2026-04-28 — Applications status badge polish

Aligned the Applications list UI with the draggable dashboard board.

Included:

- Added a shared `ApplicationStageBadge` component for compact stage display
- Moved stage theme colors into shared stage metadata
- Updated the dashboard board to reuse the shared stage theme
- Reworked `/applications` list cards with a lighter avatar, tighter metadata, responsive badge placement, and a subdued arrow affordance
- Kept `/applications` read-only for stage state; stage changes remain on dashboard drag/drop and existing selectors
- Added regression coverage for shared badge wiring and removal of the local stage label formatter

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `pnpm test` passed: 12 test files, 46 tests
- `pnpm build` passed
- `pnpm check` passed

Not included:

- Application list filtering, grouping, sorting, or direct stage mutation
- Database schema changes
- OpenAI integration changes

## 2026-04-28 — Dashboard draggable board

Optimized the authenticated dashboard application board.

Included:

- Replaced the server-rendered application columns with a client-side draggable board
- Added `@dnd-kit/core` for cross-stage drag-and-drop only
- Kept the existing stage selector pattern available on application detail pages
- Added a compact card-level stage select as a keyboard and mobile fallback
- Trimmed dashboard cards to company, role, optional location, and updated timestamp
- Added a dedicated shared stage metadata module for client-safe labels and ordering
- Added a drag-focused Server Action that reuses existing validation and user-scoped stage updates
- Added regression coverage for draggable board wiring and invalid stage update validation

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `pnpm test` passed: 12 test files, 45 tests
- `pnpm check` passed
- Local dev server was already running on `http://localhost:3000`; `/dashboard` correctly redirected to Clerk sign-in while signed out

Known limitations:

- Browser visual QA could not run because the local Playwright Chromium executable is not installed
- Drag-and-drop changes only persist the stage, not within-column ordering
- Resume upload, Resume Parse, Diagnosis, Bullet Rewrite, Outreach, Interview Review, and Weekly Report remain unimplemented

## 2026-04-28 — Dashboard redesign PR review

Reviewed PR #11 for merge safety without changing the dashboard visual direction.

Included:

- Confirmed the redesigned dashboard still uses current-user database reads, enum-backed stage grouping, and the existing Server Action-backed stage selector
- Removed unused generated stage theme fields and nonessential generated comments from the dashboard page
- Confirmed changed files do not contain bidi controls, zero-width characters, non-breaking spaces, or BOMs
- Rebasing/merge-tested the PR branch against current `main`

Validation:

- `pnpm typecheck` passed
- `pnpm lint` passed
- `pnpm test` passed: 12 test files, 44 tests
- `pnpm build` passed
- `pnpm check` passed

Not included:

- Subjective visual redesign changes
- New product features
- Database schema changes
- OpenAI integration changes

## 2026-04-28 — Workspace Data v1 QA closeout

Closed the Workspace Data v1 day with a documentation and validation pass only.

Implemented today:

- Real current-user dashboard application data and stage-grouped board
- Server Action-backed application stage updates that persist through user-scoped service and repository functions
- Hardened `/applications/[id]` with safe missing/unauthorized handling, saved JD display, stage updates, and attached resume controls
- Pasted-text Resume CRUD for create, list, detail, rename, and delete
- Optional application-to-resume attachment, detach, and change flows using only the current user's resumes

QA confirmations:

- Homepage files were not modified for this closeout task
- No new AI feature was added; JD Extract remains the only implemented OpenAI integration
- Application list, detail, create, stage update, and resume attachment paths are scoped by Clerk `userId`
- Resume list, detail, create, rename, and delete paths are scoped by Clerk `userId`
- Application stage updates are persisted by `updateMany` with both `id` and `userId`
- Resume attachment validates the selected resume belongs to the current user before create or update

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 12 test files, 44 tests
- `pnpm build` passed
- `pnpm check` passed

Known limitations:

- Manual browser QA was not performed in this closeout task
- Resume upload and Resume Parse are not implemented
- Diagnosis, Bullet Rewrite, Outreach, Interview Review, and Weekly Report are not implemented
- JD Extract requires OpenAI configuration at runtime, but this task did not call OpenAI
- At that closeout point, dashboard stage changes used a selector fallback; drag-and-drop landed later the same day

Next recommended task:

- Start a separate Resume Parse slice from `docs/05_CODEX_TASKS.md` only if that is the next selected product task. Do not bundle Diagnosis or Bullet Rewrite into that slice.

## 2026-04-28 — Application resume binding

Implemented optional Resume attachment for Applications.

Included:

- `/applications/new` now lists the current user's resumes as an optional attachment before saving
- `/applications/new` shows a small `/resumes/new` hint when no resumes exist
- `/applications/[id]` shows the attached resume with a link to `/resumes/[id]` or `No resume attached`
- Application detail supports attaching, detaching, and changing the linked resume
- Application create/update paths only attach resumes owned by the current Clerk `userId`
- Unit regression coverage for optional `resumeId` validation, ownership checks, attach, detach, and UI contracts

Not included:

- Schema changes
- Resume Parse
- PDF upload
- Diagnosis Report
- Bullet Rewrite
- OpenAI calls
- Homepage changes

## 2026-04-28 — Resume text CRUD Task C hardening

Audited and lightly hardened the existing pasted-text Resume CRUD slice.

Included:

- Confirmed `/resumes`, `/resumes/new`, and `/resumes/[id]` remain the active pasted-text resume routes
- Confirmed Resume records store pasted content in `Resume.sourceText`
- Confirmed pasted-text resumes are created with `ResumeStatus.READY`
- Confirmed list, detail, rename, and delete data access remains scoped by Clerk `userId`
- Added explicit updated timestamp metadata to the resume detail panel

Not included:

- PDF upload
- OpenAI calls
- Resume parsing
- ResumeBullet generation
- Diagnosis
- Homepage changes

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

## 2026-04-28 — Application creation and JD Extract slice

Implemented the first application management and OpenAI JD extraction slice.

Included:

- Nullable `Application.resumeId` schema change and migration for pre-resume application creation
- User-scoped application repository and service functions
- Real `/applications`, `/applications/new`, and `/applications/[id]` routes
- `POST /api/applications/extract-jd` route for authenticated JD extraction
- OpenAI client/model helpers, JD Extract prompt, schema, and service under `src/lib/ai/`
- `AiGeneration` success/failure logging for `JD_EXTRACT`
- Unit coverage for JD Extract schema fixtures and application repository query shapes

Not included:

- dashboard board business logic
- diagnosis
- resume parsing
- PDF upload
- bullet rewrite
- streaming
- outreach
- interview review
- weekly report

## 2026-04-28 — Application creation vertical slice closure

Closed today's Application creation vertical slice and stopped before unrelated AI/product features.

Included:

- `/applications/new` supports pasted JD text, JD Extract, reviewed/editable extracted fields, and Save Application
- Application persistence stores company name, role title, location, stage, original JD text, reviewed JD Extract JSON, and Clerk `userId`
- `/applications` lists persisted applications for the current user only
- `/applications/[id]` shows saved application metadata, original JD text, and extracted JD details
- Application create/list/detail database access is scoped by `userId`
- Route-level loading and error states for application pages
- Save Application pending state and a recoverable JD Extract network-error state

Not included:

- Resume Parse
- PDF upload
- Diagnosis Report
- Bullet Rewrite
- Streaming
- Outreach
- Interview Review
- Weekly Report
- Homepage changes

## 2026-04-28 — Collapsed sidebar topbar search centering

Fixed the authenticated workspace topbar so the desktop search control stays centered in the content area when the sidebar is collapsed.

Included:

- Replaced the topbar's desktop flex distribution with a three-column grid
- Kept the page title left-aligned, search centered, and account actions right-aligned
- Preserved the mobile search button behavior and existing search modal

Not included:

- Search implementation
- Sidebar persistence
- Product feature changes
- Homepage changes

## 2026-04-28 — Application resume detach-on-delete fix

Fixed the application-to-resume relation so deleting an attached resume keeps the application record.

Included:

- `Application.resumeId` now uses `onDelete: SetNull` in the Prisma schema
- Migration to replace the application resume foreign key with `ON DELETE SET NULL`
- Regression coverage for the schema and migration relation behavior

Not included:

- Resume Parse
- PDF upload
- Diagnosis Report
- Bullet Rewrite
- Streaming
- Outreach
- Interview Review
- Weekly Report
- Homepage changes

## 2026-04-28 — Dashboard application board

Replaced the dashboard placeholder with the real current-user application board.

Included:

- `/dashboard` now reads persisted applications for the current Clerk user
- Dashboard statistics for total, applied, communicating, interviewing, and offer counts
- Fixed board columns derived from the current `ApplicationStage` enum
- Application cards with company, role, location, current stage, updated date, detail link, and stage selector
- Server Action-backed stage updates scoped by both `id` and Clerk `userId`
- Centralized stage grouping, labels, options, and dashboard statistic helpers
- Unit coverage for stage update scoping, stage update validation, and dashboard grouping/stat helpers

Not included:

- Drag-and-drop
- Resume Parse
- PDF upload
- Diagnosis Report
- Bullet Rewrite
- Streaming
- Outreach
- Interview Review
- Weekly Report
- Homepage changes

## 2026-04-28 — Application detail hardening

Hardened `/applications/[id]` as the stable basic application detail page.

Included:

- Current-user scoped application detail load with safe not-found handling for missing or unauthorized records
- Top navigation back to `/applications` and `/dashboard`
- Shared Server Action-backed stage selector used by both the dashboard and application detail page
- Basic detail fields for company, role, location, stage, created date, and updated date
- Original JD text display
- Saved JD Extract display for seniority, employment type, required skills, preferred skills, responsibilities, keywords, confidence, and warnings
- Safe empty and invalid states for missing or schema-invalid `jdExtractJson`
- Regression coverage for the application detail page scope and UI contract

Not included:

- Diagnosis tabs
- Resume Parse
- Bullet Rewrite
- Outreach
- OpenAI calls
- Homepage changes
