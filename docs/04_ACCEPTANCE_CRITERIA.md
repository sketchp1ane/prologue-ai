# 04 — Acceptance Criteria

## Completed foundation acceptance

- Repository has Next.js / TypeScript / Tailwind scaffold.
- Repository has Codex instructions and MCP configuration.
- Repository has docs as source of truth.
- Repository has scripts and CI skeleton.
- Public homepage is active, static app code.
- Clerk foundation auth protects workspace routes.
- Initial Prisma data model and migrations are committed.
- Secrets are not committed.

## Completed workspace data v1 acceptance

- User-owned resume and application reads/writes are scoped by `userId`.
- User can create, list, view, rename, and delete pasted-text resumes.
- User can paste a JD, extract editable fields, and create an application.
- User can optionally attach, detach, or change a current-user resume on an application.
- User can view current-user applications in a list and on the dashboard board.
- User can change application stage from the dashboard and application detail.
- Missing or unauthorized application detail routes render the same safe not-found state.
- Resume deletion detaches related applications through `ON DELETE SET NULL`.
- JD Extract persists success/failure `AiGeneration` audit rows without storing full JD input.
- Pasted-text Resume Parse API updates user-owned Resume status, persists parsed JSON, regenerates ResumeBullet rows, and persists success/failure `AiGeneration` audit rows without storing full resume input.
- User can choose English or Simplified Chinese from `/settings`.
- Language preference is stored in a user-scoped `UserPreference` row and mirrored to a locale cookie.
- App shell navigation, settings, application stage labels, and date-relative board text resolve through the i18n dictionary.
- Public homepage users can switch English / Simplified Chinese through the navbar before signing in.
- Sign-in and sign-up pages follow the current locale for page copy, Clerk fallback copy, and Clerk prebuilt component localization.
- Authenticated dashboard, applications, resumes, JD Extract, billing, and placeholder workspace pages resolve visible UI copy from the i18n dictionary.
- User-visible application and resume form/action errors follow the current locale.
- Workspace dictionaries are serializable data only so they can be safely passed to client components.
- User can generate, cache, view, and regenerate a Diagnosis Report for a current-user application with an attached parsed resume and generated resume bullets.
- Diagnosis Report persists `Application.diagnosisJson` and records success/failure `AiGeneration` audit rows without storing raw resume or JD input.

## Future global acceptance

- User cannot access another user's resumes or applications.
- Empty states exist for resume list, dashboard, and application detail.
- AI endpoints handle rate limit, timeout, invalid input, and schema failure.
- `pnpm check` passes before release.
- New UI slices add user-facing strings to the dictionary before wiring components.
- New authenticated client components should receive dictionary slices or final strings rather than hardcoded copy.
- New AI generation slices pass the current locale into prompts and use the shared AI language instruction.

## Remaining resume flow

- User can upload PDF or paste resume text.
- User can trigger parsing from the resume UI and see parsed resume details.
- If parsing fails, user sees a clear retry/fallback path.

## Remaining application flow

- User can filter, sort, or group applications beyond the current stage board.
- Dashboard can persist within-column ordering if drag order becomes product-critical.

## Remaining bullet rewrite flow

- User can select one bullet and generate three rewrite variants.
- The UI streams or progressively displays output.
- User can copy or apply one rewrite.
- Rewrites must not fabricate facts.
