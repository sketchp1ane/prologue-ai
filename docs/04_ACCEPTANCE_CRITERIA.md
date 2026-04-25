# 04 — Acceptance Criteria

## Initialization acceptance

This package is complete when:

- Repository has Next.js / TypeScript / Tailwind scaffold.
- Repository has Codex instructions and MCP configuration.
- Repository has docs as source of truth.
- Repository has scripts and CI skeleton.
- No product feature is implemented.
- No v0 homepage UI is imported into active app routes.
- Secrets are not committed.

## Future global acceptance

- User cannot access another user's resumes or applications.
- Empty states exist for resume list, dashboard, and application detail.
- AI endpoints handle rate limit, timeout, invalid input, and schema failure.
- `pnpm check` passes before release.

## Future resume flow

- User can upload PDF or paste resume text.
- User can see parsed resume details.
- User can rename and delete a resume.
- If parsing fails, user sees a clear retry/fallback path.

## Future application flow

- User can paste JD and create an application.
- Company and role are auto-extracted when possible.
- User can change application stage.
- Dashboard shows counts by stage.

## Future diagnosis flow

- User can generate a diagnosis for one application.
- Report includes verdict, score, strengths, gaps, and actions.
- Report is persisted and can be regenerated.

## Future bullet rewrite flow

- User can select one bullet and generate three rewrite variants.
- The UI streams or progressively displays output.
- User can copy or apply one rewrite.
- Rewrites must not fabricate facts.
