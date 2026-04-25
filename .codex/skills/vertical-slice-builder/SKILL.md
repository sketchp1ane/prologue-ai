---
name: vertical-slice-builder
description: Use this skill to implement a complete Prologue feature slice from data model to UI, including validation, tests, and acceptance criteria.
---

# Vertical slice builder

## Goal

Ship one small, complete, user-visible slice at a time.

## Slice order

1. Requirement from `docs/05_CODEX_TASKS.md`
2. Data model or schema
3. Server service
4. API route or server action
5. UI component
6. Loading, empty, error states
7. Test or manual QA
8. Update docs or DEVLOG

## Do not

- Start with UI if the data contract is unknown.
- Add broad abstractions before two real use cases exist.
- Leave mock data connected to production routes.
- Implement unrelated polish while the slice is incomplete.

## Completion response format

When done, summarize:

```txt
Implemented:
- ...

Validation:
- pnpm lint: ...
- pnpm typecheck: ...
- pnpm test: ...
- pnpm build: ...

Changed files:
- ...

Risks / follow-ups:
- ...
```
