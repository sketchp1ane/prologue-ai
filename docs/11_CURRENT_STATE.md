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
- Resume detail metadata shows status, created time, updated time, and pasted-text source.
- Initial Prisma migration added for the current schema.
- Application basic creation slice added for pasted JDs.
- Application `resumeId` is nullable so applications can be created before resume parsing/upload exists.
- JD Extract service, API route, schema, prompt, and OpenAI client/model helpers added.
- JD Extract records `AiGeneration` success/failure audit rows without storing full JD input.
- Resume Parse service is connected to `POST /api/resumes/[id]/parse` for pasted-text resumes.
- Resume Parse drives `Resume.status` through `PARSING`, `READY`, and `FAILED`.
- Successful Resume Parse saves `Resume.parsedJson` and regenerates `ResumeBullet` rows from parsed experience/project bullets.
- Resume Parse records success/failure `AiGeneration` audit rows without storing full resume input.
- Resume detail includes a UI parse trigger, parsed Resume Parse v1 display, and generated bullet display.
- Resume detail supports block-level editing of valid structured parsed resume data and refreshes generated bullet records after saves.
- Resume detail no longer displays full raw source text and can replace the current resume source with pasted text or a private PDF.
- Resume detail uses a full-width single-column content layout with inline title editing and header icon actions for details, parsing, source replacement, deletion, and returning to the list.
- `/resumes/new` supports both pasted-text resume creation and private PDF upload.
- `/resumes/new` uses one shared resume title and a mutually exclusive source selector for pasted text or private PDF upload.
- `/resumes` and `/resumes/[id]` render database-unavailable retry states instead of crashing when Prisma cannot initialize a database connection.
- PDF resumes are stored in Vercel Blob through `src/lib/storage/`, enforce PDF-only files up to 10MB, and preserve pasted text as the stable fallback path.
- PDF Resume Parse uses OpenAI Responses file inputs from the stored private PDF and records success/failure `AiGeneration` audit rows without storing raw PDF contents.
- Resume Parse v1 QA closeout completed with documentation updates only and required validation commands passing.
- Application creation vertical slice is closed: `/applications/new` supports pasted JD text, JD Extract, reviewed/editable extracted fields, and Save Application.
- Applications persist `companyName`, `roleTitle`, `location`, `stage`, `jdText`, reviewed `jdExtractJson`, and `userId`.
- `/applications` lists the current user's applications only.
- `/applications` uses compact application list cards with shared stage badge styling.
- `/applications/[id]` shows basic application fields, original JD text, extracted JD details, top navigation, a stage selector, and safe missing/unauthorized handling for the current user only.
- Application routes include empty, loading, and error states for the completed slice.
- `/dashboard` reads the current user's applications, shows stage-based statistics, and groups cards into fixed `ApplicationStage` columns.
- Dashboard supports cross-stage drag-and-drop for stage changes, plus a compact stage select fallback for keyboard and mobile use.
- `/applications` uses the shared application stage badge and lighter compact card styling aligned with the dashboard board.
- `/applications/new` can optionally attach one of the current user's resumes when saving an application.
- `/applications/[id]` shows the currently attached resume, supports attach/detach/change, and only offers resumes owned by the current user.
- Application-to-resume attachment and update paths verify the resume belongs to the same Clerk `userId` before writing.
- Workspace Data v1 QA closeout completed with documentation updates only and required validation commands passing.

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
- The active resume creation flow supports pasted text and private PDF upload through one shared-title form with mutually exclusive source submission.
- Resume list and detail reads are user-scoped and show retryable unavailable states for Prisma initialization failures.
- Resume structured edits overwrite `Resume.parsedJson`, regenerate user-scoped `ResumeBullet` rows, and do not edit original PDF files or pasted source text.
- Resume source replacement keeps the same `resumeId`, clears `Resume.parsedJson`, deletes current-user generated bullets for that resume, and requires the user to manually re-run Resume Parse.
- Pasted-text resume records are created in the non-AI `READY` state and do not create parsed JSON or resume bullets.
- PDF resume records are created as `UPLOADING`, uploaded to private Blob storage, then marked `READY` with `fileUrl` and `filePath`.
- PDF files are limited to `application/pdf` inputs up to 10MB. If PDF parsing fails, the product fallback is to create a pasted-text resume version.
- Resume Parse v1 is closed for pasted-text and private PDF sources: parsing is triggered from `POST /api/resumes/[id]/parse`, uses `OPENAI_MODEL_PARSE`, persists `Resume.parsedJson`, regenerates current-user `ResumeBullet` rows without duplicates, and records `AiGeneration` success/failure audit rows without storing full resume input.
- Application creation supports pasted JD text only and stores reviewed JD Extract JSON in `Application.jdExtractJson`.
- Application reads and writes are user-scoped through Clerk `userId` and repository/service functions.
- Application detail loads and stage updates are scoped by both `Application.id` and Clerk `userId`; missing and unauthorized records render the same safe not-found state.
- Application resume attachment writes are scoped by both `Application.id` and Clerk `userId`, and non-null `resumeId` values are accepted only after a current-user resume lookup succeeds.
- Dashboard reads current-user applications only and updates stages only when both `Application.id` and `userId` match.
- Dashboard drag-and-drop and the compact fallback selector both reuse the same user-scoped stage update path.
- Application detail continues to use the Server Action-backed stage selector.
- Dashboard board columns are fixed from the current `ApplicationStage` enum and do not persist within-column ordering.
- Resume deletion detaches related applications through `ON DELETE SET NULL` rather than deleting application records.
- Workspace Data v1 validation passed on 2026-04-28 with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm check`.
- Resume Parse v1 QA validation passed on 2026-05-04 with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm check`.
- Dashboard draggable board and Applications badge polish landed after the Workspace Data v1 closeout.
- Workspace language preference landed for English and Simplified Chinese without locale-prefixed routes.
- `/settings` can save the current user's language in `UserPreference` and mirror it to the `prologue-locale` cookie.
- App shell navigation, settings copy, application stage labels, and dashboard relative dates can resolve from the shared i18n dictionaries.
- The public homepage reads `prologue-locale`, includes a navbar language selector, and resolves landing-page copy from the shared i18n dictionaries.
- `/sign-in` and `/sign-up` read `prologue-locale`; their page chrome, fallback Clerk configuration notice, and Clerk prebuilt components can display in English or Simplified Chinese.
- Visible authenticated workspace routes now resolve dashboard, applications, resumes, JD Extract, billing, placeholder page, shared control, and user-facing form/action copy from the shared i18n dictionaries.
- Workspace dictionary values are serializable data only; client components receive dictionary slices or final strings rather than server helpers.
- Future AI generation slices should use the shared AI locale instruction so generated prose follows the user's language preference.
- JD Extract and pasted-text Resume Parse are the implemented OpenAI API integrations.
- PDF Resume Parse is implemented through OpenAI Responses file inputs. PDF content is sent to OpenAI only when parsing is triggered and may be scanned by OpenAI safety systems and cost more tokens than pasted text.
- No diagnosis, bullet rewrite, outreach, interview review, or weekly report generation is implemented yet.

## Next Recommended Step

Move to Diagnosis if Resume Parse is sufficient for the current demo path. Keep Diagnosis, Bullet Rewrite, Outreach, Interview Review, and Weekly Report as separate slices.

For any future UI work, read `docs/10_DESIGN_SYSTEM.md` first and keep the imported homepage as the visual baseline.
