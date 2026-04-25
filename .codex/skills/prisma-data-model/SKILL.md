---
name: prisma-data-model
description: Use this skill whenever creating or changing Prisma schema, migrations, seed data, repository functions, or authorization checks.
---

# Prisma data model skill

## Goal

Keep data modeling simple, typed, and safe for a 3-week MVP.

## Rules

- Start from `docs/03_DATA_MODEL.md` and `docs/PRD.md`.
- Prefer explicit enums for application stage and AI artifact type.
- Add `userId` to all user-owned records.
- Add `createdAt` and `updatedAt` to all persistent entities.
- Use repository/service functions instead of scattering Prisma calls across UI code.
- Never assume authz from client input; always filter by `userId` server-side.
- Do not run destructive migrations without explicit approval.

## Standard flow

1. Edit `prisma/schema.prisma`.
2. Run `pnpm prisma format`.
3. Run `pnpm prisma generate`.
4. Create migration for local/dev.
5. Update repository functions.
6. Add seed or fixture data if useful.
7. Run typecheck and tests.
