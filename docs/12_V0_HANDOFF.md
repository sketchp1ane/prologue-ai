# 12 — v0 Homepage Handoff

## Purpose

The v0 homepage prototype is useful as a visual direction, but it should not be imported during repository initialization.

## When to import

Import after:

1. dependency install is verified
2. base app shell is stable
3. auth route plan is clear
4. Codex has read `AGENTS.md` and docs

## Codex import prompt

```txt
Read AGENTS.md, docs/10_DESIGN_SYSTEM.md, and docs/11_CURRENT_STATE.md.

I have a v0-generated homepage prototype for Prologue / 第一页. Integrate it as the public homepage only.

Do not implement:
- backend logic
- database logic
- auth logic
- OpenAI API calls
- dashboard features
- real file upload

Tasks:
1. Move homepage components into components/landing/.
2. Keep app/page.tsx as the public homepage entry.
3. Remove unused generated components and dependencies where safe.
4. Remove unsafe next config such as ignoreBuildErrors.
5. Keep the visual style aligned with docs/10_DESIGN_SYSTEM.md.
6. Run pnpm check and summarize results.
```
