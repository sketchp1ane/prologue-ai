# 09 — Risks and Decisions

Use this file to record blockers and tradeoffs.

## Decision template

```md
### YYYY-MM-DD — Decision title

Problem:

Options:

Decision:

Reason:

Fallback:

Impact:
```

## Known MVP risks

- PDF parsing may fail for some resumes. Fallback: pasted text.
- Drag-and-drop is implemented for cross-stage dashboard updates, but within-column ordering is not persisted. Fallback: keep stage dropdowns/selectors as the durable interaction.
- Streaming three cards may be complex. Fallback: stream one response containing three sections.
- Weekly report may lack data. Fallback: deterministic stats.
- v0 homepage generated code may contain unnecessary dependencies or unsafe build settings. Fallback: import only after hardening.

### 2026-05-03 — Workspace language routing

Problem:

The product needs English / Chinese switching, but the current MVP routes are already established without locale prefixes.

Options:

- Keep existing URLs and store language in user preference plus cookie.
- Move the App Router tree under `/en` and `/zh-CN`.
- Use only a browser cookie without a user-scoped database record.

Decision:

Keep existing URLs and store the language in `UserPreference`, mirrored to the `prologue-locale` cookie.

Reason:

This preserves existing links and Clerk route protection while giving signed-in users a durable cross-device preference.

Fallback:

If SEO or public multilingual landing pages become product-critical, add locale-prefixed public routes later and keep workspace routes preference-driven.

Impact:

Future UI and AI features must read the current locale from the shared i18n helpers instead of hardcoding language choices.
