# 11 — Current State

## Completed

- Repository initialization scaffold generated.
- Next.js App Router skeleton created.
- TypeScript strict mode configured.
- Tailwind CSS base configured.
- Codex config added.
- MCP config added.
- Codex skills added.
- Docs created as source of truth.
- Environment template added.
- CI workflow added.
- Static public homepage imported from the v0 prototype.
- Homepage visual style restored to the original monochrome version.
- Homepage componentized under `components/landing/`.
- Homepage is static only and contains no product backend logic.
- Clerk foundation auth added for sign-in, sign-up, and protected workspace routes.
- Static authenticated workspace shell added for dashboard and future product routes.
- Initial Prisma data model added for resumes, applications, resume bullets, bullet rewrites, interview reviews, and AI generations.
- Prisma client helper and ownership helper stubs added under `src/lib/db/`.
- First resume pasted-text CRUD slice added for list, create, detail, rename, and delete.
- User-scoped resume repository/service functions added.
- Initial Prisma migration added for the current schema.
- Application basic creation slice added for pasted JDs.
- Application `resumeId` is nullable so applications can be created before resume parsing/upload exists.
- JD Extract service, API route, schema, prompt, and OpenAI client/model helpers added.
- JD Extract records `AiGeneration` success/failure audit rows without storing full JD input.
- Application creation vertical slice is closed: `/applications/new` supports pasted JD text, JD Extract, reviewed/editable extracted fields, and Save Application.
- Applications persist `companyName`, `roleTitle`, `location`, `stage`, `jdText`, reviewed `jdExtractJson`, and `userId`.
- `/applications` lists the current user's applications only.
- `/applications/[id]` shows basic application fields, original JD text, and extracted JD details for the current user only.
- Application routes include empty, loading, and error states for the completed slice.

## Current Homepage Status

The public homepage at `/` is now active app code. It should be treated as the visual baseline for future product pages.

Future app pages should follow `docs/10_DESIGN_SYSTEM.md` for:

- monochrome brand direction
- neutral shadcn-style tokens
- typography hierarchy
- spacing and layout rules
- card, button, badge, and product mockup patterns
- empty states
- AI result cards
- dashboard restraint

The imported v0 prototype should not be used as a source for backend logic, auth logic, database logic, OpenAI API logic, upload behavior, dashboard behavior, or other business logic. It is a visual source only.

## Not Implemented Yet

- Resume upload
- Resume parsing
- PDF resume creation
- Application board business logic
- Diagnosis report generation
- Bullet rewrite
- Outreach generation
- Interview review
- Weekly report
- Rate limiting
- Cost tracking
- Deployment hardening

## Implementation Boundaries

- The homepage is static only.
- Clerk is integrated only as foundation auth and route protection.
- If Clerk environment variables are missing, `/`, `/sign-in`, and `/sign-up` remain reachable for local setup; protected workspace routes redirect to `/sign-in`.
- Prisma schema exists for the initial MVP data model, with an initial committed migration for the current schema.
- Resume CRUD database access is implemented through user-scoped repository/service functions.
- The active resume creation flow supports pasted text only and stores it in `Resume.sourceText`.
- Application creation supports pasted JD text only and stores reviewed JD Extract JSON in `Application.jdExtractJson`.
- Application reads and writes are user-scoped through Clerk `userId` and repository/service functions.
- JD Extract is the only implemented OpenAI API integration.
- No dashboard board business logic is implemented yet.
- No resume upload or parsing is implemented yet.
- No diagnosis, bullet rewrite, outreach, interview review, or weekly report generation is implemented yet.

## Next Recommended Step

Stop after the closed Application creation vertical slice. The next feature slice should start separately from `docs/05_CODEX_TASKS.md` and must not expand this task into Resume Parse, Diagnosis, Bullet Rewrite, Outreach, Interview Review, or Weekly Report.

For any future UI work, read `docs/10_DESIGN_SYSTEM.md` first and keep the imported homepage as the visual baseline.
