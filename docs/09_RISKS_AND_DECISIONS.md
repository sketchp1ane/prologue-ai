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
