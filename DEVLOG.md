# DEVLOG

## 2026-05-13 — Hide unfinished workspace nav modules

Removed unfinished module entrypoints from the authenticated workspace navigation.

Included:

- Removed JD Extract, Interviews, and Analytics from the visible app navigation items
- Updated the app shell navigation regression test to match the reduced nav set
- Kept the existing routes, protected route configuration, APIs, and application creation JD extraction flow intact

Not included:

- Deleting `/jd-extract`, `/interviews`, or `/analytics` route files
- Removing JD extraction from application creation
- Changing Clerk route protection
- Product feature changes

## 2026-05-07 — Diagnosis Report v1 QA closeout

Closed Diagnosis Report v1 with authenticated browser QA, database
persistence checks, error-state checks, and validation.

Implemented Diagnosis Report v1 scope confirmed:

- Diagnosis schema, fixtures, prompt, and OpenAI Responses structured-output
  service
- `POST /api/applications/[id]/diagnose` route with authenticated user scope
- Application detail Diagnosis Report UI with cached report rendering,
  explicit Generate and Regenerate controls, loading, error, invalid-cache, and
  prerequisite states
- `Application.diagnosisJson` persistence for successful reports
- `AiGeneration` success/failure audit rows without storing raw resume or JD
  input
- Regenerate support that overwrites the saved diagnosis only after explicit
  user action

QA confirmations:

- Authenticated browser QA used the local Clerk ticket flow and the documented
  read-only database `userId` fallback because `CLERK_TEST_USER_ID` was not set
  locally
- A real application with an attached parsed resume, generated resume bullets,
  and JD text showed the Diagnosis Report generate control
- Clicking Generate entered the loading state, returned a structured diagnosis,
  wrote `Application.diagnosisJson`, and created a successful DIAGNOSIS
  `AiGeneration`
- Refreshing `/applications/[id]` rendered the cached diagnosis report and did
  not create another DIAGNOSIS `AiGeneration`
- Clicking Regenerate explicitly reran diagnosis generation and increased the
  DIAGNOSIS `AiGeneration` count
- Anonymous `/applications/[id]` access redirected to `/sign-in`, and anonymous
  `POST /api/applications/[id]/diagnose` returned `401 unauthorized`
- An authenticated current user opening another user's application saw the safe
  not-found screen with no diagnosis control exposed
- Public homepage files were not modified for Diagnosis Report v1 and contain
  no Diagnosis, OpenAI, API, or `fetch` wiring
- Bullet Rewrite was not implemented; only the existing Prisma model, future
  planning references, and display-only diagnosis rewrite targets exist
- OpenAI SDK usage remains in server-only `src/lib/ai/` modules
- `OPENAI_API_KEY` is read only by the server-only OpenAI client helper and is
  not exposed as a `NEXT_PUBLIC_*` variable
- Diagnosis uses canonical `OPENAI_MODEL_DIAGNOSE` model routing through
  `getDiagnoseModel()`, with `OPENAI_MODEL_REASONING` retained as a legacy
  fallback for existing deployments
- Application diagnosis reads are scoped by `Application.id` and Clerk `userId`;
  nested `ResumeBullet` records are filtered by `userId`
- Application resume attachment paths validate resume ownership before writes
- Diagnosis persistence uses `updateMany` with both `Application.id` and
  `userId`
- Cached `Application.diagnosisJson` renders on `/applications/[id]` without
  calling OpenAI on page load
- Generate and Regenerate require explicit button action; the client sends
  `force: false` for first generation and `force: true` when replacing a cached
  diagnosis
- Missing resume, unparsed resume, missing generated resume bullets, and
  missing JD/JD extract are rejected before OpenAI is called
- Browser QA verified the no-resume, unparsed-resume, missing-JD,
  missing-`OPENAI_API_KEY`, and OpenAI-failure retry states
- QA-only temporary application/resume records created for error-state checks
  were removed after validation

Validation:

- Focused diagnosis tests passed: 6 files, 44 tests
- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 158 tests
- `pnpm build` passed
- `pnpm check` passed

Known limitations:

- Rate limiting and user-facing cost visibility are not implemented yet
- Bullet Rewrite, Outreach, Interview Review, and Weekly Report remain separate
  future slices

Next recommended task:

- Start Bullet Rewrite v1 only after this Diagnosis Report v1 closeout remains
  green.

## 2026-05-07 — Codex Clerk login guidance

Documented the local Clerk ticket login flow in the AI/Codex guidance files so
future browser QA can enter authenticated workspace routes safely.

Included:

- Added `pnpm dev:clerk-login -- --next=/applications` guidance to `AGENTS.md`
- Added the same authenticated browser QA convention to
  `docs/CODEX_INIT_SCHEME.md`
- Documented token handling, dev-only constraints, and the read-only local
  `userId` fallback for explicit QA requests

Validation:

- `pnpm check` passed

## 2026-05-07 — Local Clerk ticket login

Added a local-only Clerk ticket login path for browser QA in authenticated
workspace routes.

Included:

- Added `pnpm dev:clerk-login -- --next=/applications` to mint a short-lived
  Clerk sign-in token for `CLERK_TEST_USER_ID`
- Added `/dev/clerk-ticket` to consume the one-time token through Clerk's ticket
  strategy and redirect to a sanitized local path
- Documented the local test-user setup and added regression coverage for
  production gating, safe redirects, and environment template fields

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 158 tests
- `pnpm build` passed
- `pnpm check` passed
- Browser smoke loaded `/dev/clerk-ticket?next=/applications` and showed the
  missing-token state without a framework overlay
- Browser QA generated a fresh Clerk sign-in token from a local database
  `userId`, consumed it through `/dev/clerk-ticket`, and landed on
  `/applications` with the authenticated application list visible
- `CLERK_SECRET_KEY= CLERK_TEST_USER_ID= node scripts/dev-clerk-login.mjs
  --next=/applications` failed safely before making a Clerk request

## 2026-05-07 — Context rail expanded layout fix

Fixed the application detail layout so the expanded diagnosis context rail no
longer covers the sticky Diagnosis Report section navigation.

Included:

- Synced the desktop grid rail column with the context rail's expanded `22rem`
  width
- Kept the collapsed rail at the existing `4.5rem` column width
- Added regression coverage for the expanded and collapsed grid column classes

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed
- Browser smoke reached the local app, but authenticated diagnosis-page visual
  QA was blocked by the in-app browser's signed-out Clerk session

## 2026-05-07 — Diagnosis section navigation

Added an in-report sticky navigation bar to the application Diagnosis Report so
users can jump directly to summary, score breakdown, strengths, gaps,
recommended actions, rewrite targets, and warnings.

Included:

- Added stable diagnosis section anchors and smooth in-page navigation
- Added active-section tracking with `IntersectionObserver`
- Added a compact horizontal pill navigation that stays near the top while
  reading the diagnosis report
- Reused existing diagnosis labels and added Summary / Report sections copy in
  English and Simplified Chinese
- Preserved existing score animations, card reveal animations, and generation
  flow

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test -- tests/application-qa-regressions.test.ts` passed
- `pnpm check` passed

## 2026-05-07 — Context rail collapsed spacing polish

Polished the collapsed application context rail so icon buttons sit with even
left and right spacing inside the narrow rail.

Included:

- Centered the collapsed rail controls with a dedicated `items-center` column
- Tuned collapsed rail vertical spacing and height to match the larger icon
  gaps
- Added regression coverage for the centered collapsed rail layout classes

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test -- tests/application-qa-regressions.test.ts` passed
- `pnpm check` passed

## 2026-05-07 — Context rail single-container morph

Reworked the application detail context rail so the collapsed rail itself
morphs into the expanded context panel instead of showing a second sibling
panel beside it.

Included:

- Replaced the separate `right-full` floating panel with one desktop
  `context-rail-shell`
- The shell now transitions between `4.5rem` and `22rem` while keeping its
  right edge anchored to the rail column
- Collapsed icon controls and expanded context content crossfade inside the
  same shell so both states are not visually present at once
- Preserved the right-panel internal `scrollTo` shortcut behavior and mobile
  card flow
- Added reduced-motion handling for the morph and crossfade transitions

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test -- tests/application-qa-regressions.test.ts` passed
- `pnpm check` passed

## 2026-05-07 — Context rail floating panel scroll UX

Changed the application detail context rail from a layout-resizing side column
into a fixed narrow rail with a floating, independently scrollable context
panel.

Included:

- Kept the desktop application detail grid fixed at the narrow rail width so
  expanding context does not reflow the diagnosis column
- Added an anchored floating context panel that opens beside the narrow rail
- Moved stage, details, JD materials, and attached resume into an internal
  scroll container with a fixed panel header
- Replaced page-level `scrollIntoView` shortcut behavior with right-panel
  `scrollTo` behavior so shortcut clicks no longer move the diagnosis column
- Preserved the mobile card flow and existing stage, JD drawer, and resume
  dialog interactions

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test -- tests/application-qa-regressions.test.ts` passed
- `pnpm check` passed

## 2026-05-07 — Context rail sticky offset fix

Fixed the collapsed application context rail so its expand/collapse control no
longer slides under the sticky topbar while scrolling.

Included:

- Raised the desktop sticky offset from generic page spacing to the app topbar
  height plus breathing room
- Added regression coverage for the `lg:top-24` offset

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test -- tests/application-qa-regressions.test.ts` passed
- `pnpm check` passed

## 2026-05-07 — Application context rail collapse

Refocused the application detail page around the JD Diagnosis Report by moving
the right-side context modules into a collapsible client rail.

Included:

- Added `ApplicationContextRail` as the owner of the stage, details, JD
  materials, and attached resume context modules
- Desktop now defaults the context rail to a narrow icon-only column so the
  diagnosis report gets more horizontal space
- Expanded rail restores the full context cards and preserves existing stage
  select, JD drawer, and resume dialog interactions
- Collapsed shortcut buttons expand the rail and scroll to the selected context
  module
- Mobile keeps the context modules expanded in the normal page flow
- English and Simplified Chinese copy now include context rail title and
  expand/collapse labels

Not included:

- Diagnosis, JD, resume, application schema, API, Server Action, or database
  changes
- New tooltip or drawer dependencies

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Diagnosis score motion polish

Added restrained data-reveal motion to the Diagnosis Report scoring areas.

Included:

- Replaced the overall-score conic background with an SVG stroke ring that
  draws from 0 to the saved score
- Added count-up numbers for the overall score and dimension scores
- Reworked the overall progress strip and radar score bars to animate via
  `transform: scaleX()` instead of layout-changing width updates
- Added lightweight reveal motion for the report score sections
- Added `prefers-reduced-motion` handling for diagnosis score animations
- Added regression coverage for the local animation components, CSS keyframes,
  reduced-motion handling, and avoiding new motion dependencies
- Follow-up fix: score rings and progress bars now explicitly mount at 0 and
  transition to the target score on the next animation frame, so initial page
  entry does not render them already filled
- Follow-up fix: score rings and progress bars now start only after their
  section first enters the viewport, so below-the-fold diagnosis scores do not
  finish animating before the user scrolls to them
- Follow-up fix: dimension score bars and their right-side numeric scores now
  share the same row delay and duration, so each row fills and counts in sync

Not included:

- Diagnosis schema, API, Server Action, database, or generation changes
- New animation dependencies
- Layout changes outside the Diagnosis Report presentation

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Diagnosis card reveal motion

Added scroll-triggered reveal motion to the Diagnosis Report content cards below
the score section.

Included:

- Added shared `RevealSection` and `RevealCard` helpers that reuse the existing
  viewport-once observer
- Strengths, gaps, recommended actions, rewrite targets, and warnings now reveal
  their cards only after each section first enters the viewport
- Cards reveal one after another with a 70ms stagger inside each section
- Empty states use the same reveal treatment
- Added reduced-motion handling and regression coverage for the shared reveal
  classes and delay token
- Follow-up polish: card reveal motion now starts from the local lower-right and
  settles into place with a 460ms transition, matching the requested attachment
  feel

Not included:

- Diagnosis data, schema, API, Server Action, or generation changes
- New animation dependencies

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — JD drawer sheet motion

Refined the JD information drawers so they feel less abrupt and better match a
native right-side sheet interaction.

Included:

- Added a reusable `components/ui/sheet.tsx` wrapper around the existing Radix
  Dialog primitives
- Reworked the JD material drawers to use the shared Sheet component
- Added right-side slide and overlay fade animations for sheet open/close states
- Tuned sheet motion to 360ms on open and 240ms on close
- Added `prefers-reduced-motion` handling for the sheet animations
- Increased desktop drawer width to roughly two thirds of the viewport while
  keeping mobile close to full width
- Added regression coverage for the shared Sheet component, animation hooks, and
  larger drawer width

Not included:

- New drawer dependencies
- JD schema, API, database, or extraction behavior changes

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — JD material drawers

Moved saved JD reference material out of the application-detail main column and
into right-rail drawer buttons.

Included:

- The main application detail column now focuses on the Diagnosis Report
- Added a right-rail JD materials card with buttons for Original JD and
  Extracted structured fields
- Each button opens a right-side Radix Dialog drawer with the existing read-only
  JD content, including invalid and missing extract states
- English and Simplified Chinese copy now include the JD materials card title
  and description

Not included:

- JD extraction schema changes
- API, Server Action, database, or OpenAI service changes
- JD editing or re-extraction behavior

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Attached resume dialog settings

Changed the application-detail attached resume control from an inline select to
a settings dialog.

Included:

- The attached resume card now keeps the current preview or empty state in the
  card body and places a compact settings icon in the card header
- The settings dialog lists "no resume attached" plus all current-user resumes
  with status and updated metadata
- Changing the attached resume now requires an explicit Save from the dialog and
  still uses the existing `updateApplicationResumeAction`
- English and Simplified Chinese copy now include an accessible settings label

Not included:

- Resume relationship schema changes
- Application API or Server Action changes
- Diagnosis prerequisite changes

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Application detail right-rail stage layout

Moved the application stage control out of the main content flow and into the
right rail so the Diagnosis Report can start immediately under the page header.

Included:

- Removed the full-width current-stage card above the application detail grid
- Added a right-rail current-stage card above application metadata and attached
  resume controls
- Kept the stage selector wired to the existing colored Radix stage dropdown
- Let the stage dropdown be the only visible current-stage value in that card
- Removed the duplicate stage row from the metadata card

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Application detail stage select color polish

Added shared lightweight application-stage color markers to the stage selector
on application detail pages.

Included:

- `/applications/[id]` keeps the current stage summary text simple while the
  right-side stage selector now shows the current stage dot in the trigger
- The stage dropdown menu now renders every option with the shared
  `APPLICATION_STAGE_THEME` color dot and a checked indicator
- The selector still submits through the existing `updateApplicationStageAction`;
  the application stage data model is unchanged

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Diagnosis report hierarchy polish

Refined the application-detail Diagnosis Report reading experience without
changing the diagnosis schema, API, persistence, or AI generation behavior.

Included:

- Reworked the report into a conclusion-first flow with a score ring, verdict
  chips, summary, dimension bars, strengths, gaps, actions, rewrite targets,
  and warnings
- Added restrained sage, amber, and rose accents only for semantic markers,
  priority chips, left rails, progress accents, and warning icons
- Changed recommended actions into a numbered list and rewrite targets into a
  clearer display-only bullet review structure
- Preserved duplicate-safe list keys for repeated read-only diagnosis strings

Not included:

- Diagnosis schema changes
- API, Server Action, database, or OpenAI service changes
- Bullet Rewrite implementation

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed after rerunning it separately from `pnpm build`
- Browser smoke on the existing `http://localhost:3000` dev server confirmed
  protected application detail routes redirect to sign-in with no Next.js error
  dialog or build/runtime error text; authenticated report content still needs a
  signed-in browser session for visual inspection

## 2026-05-07 — Application list duplicate key fix

Fixed duplicate React key warnings in read-only application list displays.

Included:

- `/applications/[id]` now renders saved JD Extract list items with keys that
  stay unique even when an extracted array contains repeated values
- Diagnosis report read-only lists use the same duplicate-safe key pattern
- The JD Extract preview list no longer keys rows only by display text
- Regression coverage prevents the application detail and diagnosis report
  lists from returning to `key={item}`

Not included:

- JD Extract schema changes
- Stored `jdExtractJson` cleanup or deduplication
- Database migrations
- API, Server Action, or OpenAI service changes

Validation:

- `pnpm typecheck` passed
- `pnpm check` passed
- Browser smoke opened the protected application detail URL in a fresh
  Playwright session, confirmed no framework overlay and no duplicate-key
  console message before Clerk redirected to sign-in

## 2026-05-07 — Diagnosis Report UI completion

Completed the Task D application-detail Diagnosis Report UI without changing
the homepage, OpenAI service, API route, Bullet Rewrite, streaming, or Outreach.

Included:

- `/applications/[id]` now computes whether the attached resume is missing,
  unparsed, or ready for diagnosis before rendering the report panel
- The Diagnosis Report panel disables generation until prerequisites are met
  and guides users to create, attach, or parse a resume
- Cached `Application.diagnosisJson` still renders on page load without
  calling OpenAI automatically
- Generate and Regenerate continue to use `POST /api/applications/[id]/diagnose`
  with `force` set from whether a valid cached report exists
- The report now renders overall score, HR verdict, verdict level, summary,
  radar scores as simple bars, strengths, gaps with recommendations,
  recommended actions, display-only rewrite targets, and warnings
- English and Simplified Chinese diagnosis copy now covers prerequisites,
  retry, score labels, rewrite targets, warnings, priorities, and empty states
- Regression coverage now locks the prerequisite wiring, full report rendering
  fields, no chart dependency imports, and no future AI feature scope

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 156 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Diagnosis API persistence alignment

Aligned Task C with the existing Diagnosis Report route, service, and
persistence path without changing the homepage or expanding into Bullet
Rewrite, streaming, Outreach, Interview Review, or Weekly Report.

Included:

- Kept `POST /api/applications/[id]/diagnose` as the Diagnosis Report
  endpoint with the existing `{ force?: boolean }` request shape
- Preserved cached `Application.diagnosisJson` reads so page load does not call
  OpenAI, and forced regenerate overwrites the persisted diagnosis
- Allowed Diagnosis generation when either raw `Application.jdText` is present
  or stored `Application.jdExtractJson` validates against `jdExtractSchema`
- Kept application, resume, resume bullet, and diagnosis persistence paths
  scoped by Clerk `userId`
- Added a distinct `schema_validation_failed` error code for model output that
  does not match the diagnosis schema
- Expanded diagnosis service, route, and OpenAI service tests for JD fallback
  and schema validation error mapping

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 155 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Diagnosis OpenAI service alignment

Aligned the existing Diagnosis Report OpenAI service with the Task B
server-side contract without changing the application detail UI, homepage,
Bullet Rewrite, streaming, Outreach, or route wiring.

Included:

- Added canonical `OPENAI_MODEL_DIAGNOSE` model routing through
  `getDiagnoseModel()`
- Kept `OPENAI_MODEL_REASONING` as a temporary fallback for existing
  deployments
- Added `OPENAI_MODEL_DIAGNOSE` to `.env.example`
- Added low-level `generateDiagnosis()` input validation for required ids,
  parsed resume JSON, JD text, locale, application fields, JD extract shape,
  and non-empty ResumeBullet records
- Kept OpenAI Responses Structured Outputs through `zodTextFormat` and a
  second `diagnosisSchema.parse()` validation pass
- Preserved safe `AiGeneration` success/failure audit rows without storing raw
  resume text, full JD text, or serialized prompts
- Expanded diagnosis service tests for canonical model routing, fallback
  routing, OpenAI configuration failures, pre-OpenAI input rejection, schema
  failures, unknown rewrite targets, locale instruction, and private-content
  logging guards

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 25 test files, 152 tests
- `pnpm build` passed
- `pnpm check` passed

## 2026-05-07 — Diagnosis schema contract v2

Updated the Diagnosis Report structured output contract without adding OpenAI
calls, UI feature scope, Bullet Rewrite, streaming, or homepage changes.

Included:

- Replaced the diagnosis schema with the v2 score, verdict, radar, gap,
  action, rewrite target, and warning contract
- Tightened diagnosis prompt safety rules around untrusted resume/JD input,
  evidence grounding, and existing ResumeBullet ids
- Added service validation that rejects rewrite targets pointing at unknown
  ResumeBullet ids
- Updated diagnosis fixtures and schema tests for the new contract
- Preserved the existing Diagnosis Report UI files unchanged
- Updated the OpenAI API contract documentation

Validation:

- Full command results are recorded in the task final response

## 2026-05-07 — Diagnosis Report v1

Implemented Diagnosis Report v1 as a focused application detail slice.

Included:

- Added `diagnosis_v1` schema, prompt, and OpenAI Responses service with
  Structured Outputs through `zodTextFormat`
- Added `OPENAI_MODEL_REASONING` model routing for diagnosis generation
- Added user-scoped application diagnosis input loading and
  `Application.diagnosisJson` persistence
- Added `POST /api/applications/[id]/diagnose` with authentication,
  prerequisite errors, cache reuse, forced regeneration, and route
  revalidation
- Recorded `AiGeneration` success/failure rows for `DIAGNOSIS` without storing
  raw resume or JD input
- Added a localized application detail report card with generate/regenerate,
  loading, API error, invalid cached JSON, cached result display, score,
  verdict, strengths, gaps, actions, and bullet suggestions

Not included:

- Bullet Rewrite
- Streaming
- Outreach
- Interview Review
- Weekly Report
- Homepage changes
- New dependencies

Validation:

- Focused diagnosis/application tests passed
- `pnpm typecheck` passed

## 2026-05-04 — Resume Parse v1 QA closeout

Closed Resume Parse v1 with documentation-only QA and validation.

Implemented Resume Parse v1 scope confirmed:

- Resume Parse schema, prompt, fixtures, and OpenAI service
- `POST /api/resumes/[id]/parse` route with authenticated user scope
- Parse lifecycle updates through `PARSING`, `READY`, and `FAILED`
- `Resume.parsedJson` persistence for successful parses
- `ResumeBullet` regeneration from parsed experience and project bullets
- Resume detail structured rendering and generated bullet display
- Resume list parse-state display
- Pasted-text resume parsing and private PDF resume parsing through OpenAI
  Responses file inputs

QA confirmations:

- Task G made no homepage edits to `app/page.tsx`, `components/landing/*`, or
  `app/globals.css`
- `app/api` contains only JD Extract and Resume Parse API routes
- Diagnosis and Bullet Rewrite remain unimplemented; only Prisma models and
  future-facing copy/metadata exist for those slices
- OpenAI SDK calls remain in server-only `src/lib/ai/` service modules
- `OPENAI_API_KEY` is read only by the server-only OpenAI client helper and is
  not exposed as a `NEXT_PUBLIC_*` variable
- Resume Parse reads `OPENAI_MODEL_PARSE` from environment-based model routing
- Resume list, detail, create, update, delete, source replacement, and parse
  paths are scoped by Clerk `userId`
- Successful parses save `Resume.parsedJson`, set the resume back to `READY`,
  and regenerate current-user `ResumeBullet` rows after deleting prior rows for
  that resume to prevent duplicates
- Failed parses set `Resume.status` to `FAILED` and record failure metadata in
  `AiGeneration`

Validation:

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed: 21 test files, 128 tests
- `pnpm build` passed
- `pnpm check` passed

Known limitations:

- Manual browser QA was not performed because this closeout changed
  documentation only
- Rate limiting and user-facing cost visibility are not implemented yet
- Diagnosis, Bullet Rewrite, Outreach, Interview Review, and Weekly Report
  remain separate future slices
- PDF parsing depends on OpenAI file-input processing and may use more tokens
  than pasted text; pasted text remains the fallback path when PDF parsing fails

Next recommended task:

- Start Diagnosis Report v1 as a separate slice now that Resume Parse v1 is
  documented and validation is green.

## 2026-05-04 — Resume list delete action

Added delete support directly from the resume list.

Included:

- Added a danger-styled delete icon on each resume card
- Reused the existing user-scoped delete server action
- Added a confirmation dialog before deletion
- Kept list delete success and error feedback on the existing toast path

Not included:

- Bulk delete
- Undo or restore behavior

Validation:

- Full validation results are recorded in the task final response

## 2026-05-04 — Resume toast feedback

Unified temporary resume operation feedback around toast notifications.

Included:

- Added the shared Sonner toaster and route-query toast bridge
- Replaced resume list, new resume, and detail redirect banners with toasts
- Moved resume parse success/error feedback to toast notifications
- Moved structured parsed-resume edit save feedback to toast notifications

Not included:

- Converting persistent states such as empty, missing parsed JSON, database
  unavailable, source warnings, or delete confirmation warnings into toasts
- API, validation, database, or Prisma schema changes

Validation:

- Full validation results are recorded in the task final response

## 2026-05-04 — Resume detail header icon actions

Converted resume detail actions from right-side cards to header icon controls.

Included:

- Changed resume detail to a single full-width content column
- Moved back, detail, parse, replace source, and delete into icon-only header
  actions with accessible labels and title tooltips
- Added dialogs for metadata, source replacement, and delete
  confirmation
- Added inline title editing directly beside the resume detail page title
- Reused the existing parse API from a compact header icon action

Not included:

- New Prisma schema fields
- Raw source text display
- Automatic parsing after source replacement

Validation:

- Full validation results are recorded in the task final response

## 2026-05-04 — Resume source replacement

Added source replacement on resume detail and removed full raw source display.

Included:

- Removed the raw source text card from the resume detail main column
- Added a right-side replace-source card for mutually exclusive pasted text or
  private PDF replacement
- Kept the existing `resumeId` and application links while clearing old
  `parsedJson` and generated `ResumeBullet` rows after replacement
- Added user-scoped repository/service/action paths for source replacement
- Added best-effort cleanup for replaced or unattached PDF blobs
- Added English and Simplified Chinese copy for source replacement states
- Added validation, repository, and service coverage for replacement flows

Not included:

- Automatic Resume Parse after replacing the source
- New resume version creation
- Prisma schema changes or source edit history

Validation:

- Full validation results are recorded in the task final response

## 2026-05-04 — Resume structured detail editing

Added block-level editing for structured Resume Parse output on resume detail.

Included:

- Upgraded the parsed resume detail card so users can edit basics, summary,
  skills, experience, education, projects, certifications, and languages by
  section
- Added a user-scoped server action and service path that validates edited
  structured resume JSON, saves `Resume.parsedJson`, and regenerates
  `ResumeBullet` rows in the existing transaction
- Kept warnings read-only and preserved original source text/PDF metadata
- Added English and Simplified Chinese copy for editor controls, save states,
  validation errors, and re-parse overwrite warnings
- Added unit coverage for edited resume validation and service-level bullet
  regeneration

Not included:

- Editing original PDF or pasted source text
- A full rich-text resume editor or PDF export
- Edit history, snapshots, or additional Prisma migrations

Validation:

- Full validation results are recorded in the task final response

## 2026-05-04 — Resume database fallback states

Hardened resume pages against transient Prisma database initialization failures.

Included:

- Added the same database-unavailable fallback pattern used by Dashboard to the
- resume list and detail pages
- Added English and Simplified Chinese resume-specific retry copy
- Kept unexpected database and application errors rethrowing normally

Not included:

- Database provider configuration changes
- Automatic retry loops
- Changes to resume repository authorization filters

Validation:

- `pnpm check` passed

## 2026-05-03 — Unified resume creation source selector

Redesigned `/resumes/new` so resume creation uses one shared title and one
selected source at a time.

Included:

- Replaced the previous parallel pasted-text/PDF forms with a single client
  form that preserves drafts while switching between source modes
- Added a shared `sourceType` validation path that rejects simultaneous
  pasted text and PDF submissions
- Kept existing resume service behavior: pasted text creates a ready source
  text record, and PDF upload creates a private stored PDF record
- Updated English and Simplified Chinese copy for the new source selector,
  active-source hints, file selection state, and validation error
- Added unit coverage for the unified resume creation validator

Not included:

- Prisma schema changes
- Automatic Resume Parse after creation
- Resume editor behavior

Validation:

- Full validation results are recorded in the task final response

## 2026-05-03 — Authenticated workspace bilingual coverage

Extended English / Simplified Chinese support across the visible authenticated
workspace.

Included:

- Added workspace dictionary groups for dashboard, applications, resumes, JD
  Extract, billing, placeholder pages, shared controls, and user-facing errors
- Localized the visible authenticated routes: dashboard, application list/create/detail,
  resume list/create/detail, JD Extract, analytics, billing, candidates, and
  interviews
- Updated shared application and resume client components to receive serializable
  dictionary slices instead of hardcoded copy
- Mapped user-visible server action failures and success messages to the current
  locale while leaving internal service/API contracts stable
- Added regression coverage for serializable workspace dictionaries and bilingual
  workspace copy

Not included:

- Locale-prefixed routes
- Translating user-provided resume/JD content or extracted facts
- Localizing internal logs, service error class messages, or API error codes

Validation:

- Full validation results are recorded in the task final response

## 2026-05-03 — Workspace language preference

Added English / Simplified Chinese language infrastructure for the authenticated
workspace without changing existing URLs.

Included:

- Added `UserPreference` with a Prisma `UserLocale` enum and non-destructive
  migration
- Added shared i18n config, dictionaries, server locale helpers, relative-date
  formatting, and AI output-language instructions
- Added user preference repository/service functions with user-scoped upsert and
  `prologue-locale` cookie persistence
- Added a language section to `/settings`
- Localized app shell navigation, settings copy, application stage labels, and
  dashboard board relative date text
- Added tests for locale validation, dictionary-backed navigation/stages, AI
  language instructions, and user preference persistence

Not included:

- Locale-prefixed routes such as `/zh-CN/dashboard`
- Full public homepage localization
- Clerk prebuilt auth UI localization

Validation:

- Full validation results are recorded in the task final response

Follow-up:

- Extended the same locale cookie support to the public homepage
- Added a homepage language selector in the navbar
- Localized the homepage nav, hero, feature cards, workflow strip, footer, and
  product mockup chrome
- Extended locale-aware copy to `/sign-in` and `/sign-up`
- Added Clerk component localization through `@clerk/localizations`

## 2026-05-03 — Stretch Task F PDF resume upload

Added PDF upload support for Resume Parse v1 while keeping pasted-text resume
creation and parsing unchanged.

Included:

- `/resumes/new` now offers pasted-text creation and private PDF upload side by
  side
- PDF uploads enforce `application/pdf`, `.pdf` filename, and a 10MB limit
- PDF resumes create user-owned `Resume` records as `UPLOADING`, store the file
  in private Vercel Blob, then mark the record `READY`
- Resume deletion attempts to remove the stored PDF when a `filePath` exists
- Resume Parse now uses pasted text first, then falls back to OpenAI Responses
  file input for PDF-only resumes
- PDF parse success/failure records `AiGeneration` rows without storing raw PDF
  content
- Documentation now calls out private Blob storage, OpenAI file-input scanning,
  token-cost implications, and pasted-text fallback

Not included:

- Diagnosis Report
- Bullet Rewrite
- Queues
- New storage providers
- Homepage changes

Validation:

- Full validation results are recorded in the task final response

## 2026-05-03 — Resume list parse state cards

Updated `/resumes` so the list reflects Resume Parse v1 state instead of only
showing basic CRUD metadata.

Included:

- Added parsed JSON presence and generated bullet counts to the user-scoped
  resume list query without selecting full source text
- Added list-state helpers for Not parsed, Parsing, Ready, and Failed display
- Reworked resume cards with compact parse-state badges, updated timestamps,
  parsed JSON presence, bullet record counts, and explicit View / Parse /
  Re-parse / Retry actions
- Kept parsing actions routed to the existing resume detail parse workspace
- Added regression coverage for list query fields and state derivation

Not included:

- PDF upload
- Diagnosis
- Bullet Rewrite
- Homepage changes
- New dependencies or schema changes

Validation:

- Full validation results are recorded in the task final response

## 2026-05-03 — Resume detail parse UI

Turned `/resumes/[id]` into the primary Resume Parse v1 operation page.

Included:

- Added a user-scoped resume detail query that loads parsed JSON, source text,
  and ordered `ResumeBullet` records
- Added a client-side parse control that calls the existing
  `POST /api/resumes/[id]/parse` route, shows pending state, supports retry
  after failure, and refreshes the route after parsing
- Rendered valid `parsedJson` with basics, summary, skills, experience,
  education, projects, certifications, languages, and warnings
- Added a safe invalid parsed JSON state with preserved source text and re-parse
  path
- Grouped read-only `ResumeBullet` records by section type and section title
- Kept the original source text visible in a collapsible detail card
- Added unit coverage for parsed JSON classification, bullet grouping, and the
  detail repository query

Not included:

- Inline resume editing beyond existing rename/delete
- Bullet Rewrite
- Diagnosis
- PDF upload
- Homepage changes

Validation:

- Full validation results are recorded in the task final response

## 2026-05-03 — Resume parse route state machine

Connected the existing Resume Parse service to persisted Resume state and
ResumeBullet regeneration.

Included:

- Added `POST /api/resumes/[id]/parse` as the authenticated parse entrypoint
- Added user-scoped Resume status transitions for `PARSING`, `READY`, and
  `FAILED`
- Rejected missing/unauthorized resumes, invalid ids, missing source text, and
  already-running parses with stable API error codes
- Saved validated parsed JSON to `Resume.parsedJson`
- Regenerated `ResumeBullet` rows from parsed experience and project bullets
  after deleting old current-user bullets for the same resume
- Kept parse failure details in existing `AiGeneration.errorMessage`; no
  Resume schema change was added
- Added route, service/state-machine, and repository tests for user scoping,
  status transitions, duplicate-bullet prevention, and failure handling

Not included:

- PDF upload
- Resume Parse UI button or parsed resume display
- Diagnosis
- Bullet Rewrite
- Homepage changes

Validation:

- Targeted typecheck and tests passed during implementation
- Full validation results are recorded in the task final response

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
