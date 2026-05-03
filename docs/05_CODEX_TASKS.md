# 05 — Codex Task Queue

Use this file as the task source of truth. Codex should complete tasks in order unless a blocker is documented.

## Completed by this initialization package

### T00 — Repository initialization

Status: completed.

Included:

- Next.js App Router skeleton
- TypeScript strict configuration
- Tailwind base setup
- Codex config
- MCP config
- skills
- docs
- scripts
- CI skeleton

Not included:

- product UI
- v0 homepage implementation
- auth
- database models
- OpenAI API calls
- file upload
- dashboard

## Phase 1 — Foundation after initialization

### T01 — Verify scaffold and dependency install

Status: completed.

Prompt:

```txt
Read AGENTS.md and docs/*.md. Verify the initialized repository. Install dependencies, run pnpm check, and fix only initialization-level issues. Do not implement product features or UI.
```

Acceptance:

- `pnpm install` succeeds
- `pnpm check` succeeds, or failures are documented with exact reasons
- no product feature is implemented

### T02 — Data model

Status: completed.

Prompt:

```txt
Using docs/03_DATA_MODEL.md, docs/PRD.md, and the prisma-data-model skill, create the initial Prisma schema, enums, generated client setup, and seed script. Add repository stubs for resumes, applications, and AI generations. Do not build UI yet.
```

Acceptance:

- Prisma format/generate passes
- repository functions are typed
- every user-owned model includes userId

### T03 — Auth and app shell

Status: completed.

Implement Clerk auth, protected route structure, dashboard layout placeholder, nav placeholders, and settings placeholder. Keep UI minimal and consistent with the future v0 homepage visual direction.

### T04 — Import and harden v0 homepage

Status: completed.

Import the v0-generated homepage prototype only after T01-T03 are stable.

Prompt:

```txt
Read AGENTS.md, docs/10_DESIGN_SYSTEM.md, and docs/11_CURRENT_STATE.md. Import the v0 homepage prototype as the real public homepage. Do not add backend logic, auth logic, database logic, OpenAI API calls, or dashboard features. Clean generated code, remove unsafe config, and keep the homepage componentized.
```

### T05 — Resume create/list/detail skeleton

Status: completed.

Implement resume upload/paste UI shell, list, detail, rename, and delete flow placeholders before AI parsing.

## Phase 2 — Core product and AI features

### T06 — Resume parse with OpenAI

Status: completed for pasted-text API parsing.

Implement resume parse service and route with schema validation and fallback.

### T07 — Application board and JD extract

Status: completed before T06.

Implement application creation from JD, JD extraction, stage board, and stage update.

### T08 — Diagnosis report

Implement diagnosis generation, persistence, report UI, and regenerate action.

### T09 — Bullet rewrite streaming

Implement streaming rewrite API, side drawer UI, copy/apply actions, and truthfulness warnings.

### T10 — Outreach message

Implement outreach copy generation with tone options and copy buttons.

### T11 — Interview review

Implement notes form, saved notes, AI review, and next-step suggestions.

### T12 — Weekly report

Implement dashboard weekly insight with deterministic fallback.

## Phase 3 — Hardening

### T13 — Rate limits and cost visibility

Add per-user AI limits, usage metadata display, and helpful quota messages.

### T14 — Multi-agent review

Prompt:

```txt
Spawn frontend, backend, AI, and security reviewer agents. Ask each to review this branch against AGENTS.md and docs/*.md. Wait for all results, deduplicate issues, rank by severity, then fix the top issues that are safe to fix.
```

### T15 — Release polish

Add README screenshots, demo data, deployment checklist, and final E2E smoke test.
