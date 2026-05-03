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

## Future global acceptance

- User cannot access another user's resumes or applications.
- Empty states exist for resume list, dashboard, and application detail.
- AI endpoints handle rate limit, timeout, invalid input, and schema failure.
- `pnpm check` passes before release.

## Remaining resume flow

- User can upload PDF or paste resume text.
- User can trigger parsing from the resume UI and see parsed resume details.
- If parsing fails, user sees a clear retry/fallback path.

## Remaining application flow

- User can filter, sort, or group applications beyond the current stage board.
- Dashboard can persist within-column ordering if drag order becomes product-critical.

## Remaining diagnosis flow

- User can generate a diagnosis for one application.
- Report includes verdict, score, strengths, gaps, and actions.
- Report is persisted and can be regenerated.

## Remaining bullet rewrite flow

- User can select one bullet and generate three rewrite variants.
- The UI streams or progressively displays output.
- User can copy or apply one rewrite.
- Rewrites must not fabricate facts.
