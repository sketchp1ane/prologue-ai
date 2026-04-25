# 10 — Design System

## Current status

No UI is implemented in this initialization package.

The v0-generated homepage prototype is treated as a future visual reference, not active code.

## Intended visual direction

- Tailwind / shadcn style
- Notion-like editorial clarity
- Apple-like premium minimalism
- off-white background
- charcoal typography
- muted gray secondary text
- restrained blue accent
- rounded cards
- subtle borders
- soft shadows
- generous whitespace

## Future homepage import rule

When the v0 homepage is imported, Codex should:

1. Keep only the public homepage.
2. Remove backend, API, auth, database, and fake product logic.
3. Refactor components into `components/landing/`.
4. Remove unnecessary `use client` directives.
5. Remove unsafe config such as `typescript.ignoreBuildErrors`.
6. Keep the homepage as the visual baseline for future app pages.
