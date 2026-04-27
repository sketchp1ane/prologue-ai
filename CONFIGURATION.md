# Prologue Configuration Guide

This guide explains the configuration required to run the current Prologue app locally and in deployment.

Current implemented private flows:

- Clerk-protected workspace routes
- pasted-text Resume CRUD
- Application creation from pasted JD
- JD Extract through OpenAI Responses API
- Prisma/Postgres persistence

Do not commit `.env.local` or any real secret.

## 1. Create Local Environment File

```bash
cp .env.example .env.local
```

Then fill `.env.local`.

## 2. Required Configuration

### App URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use the deployed URL in production, for example:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### Clerk Auth

Required for protected routes such as `/dashboard`, `/resumes`, and `/applications`.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

How to configure:

1. Create or open a Clerk application.
2. Copy the Publishable Key into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. Copy the Secret Key into `CLERK_SECRET_KEY`.
4. Keep the sign-in/sign-up URLs above unless the app routes change.

Reference: [Clerk environment variables](https://clerk.com/docs/guides/development/clerk-environment-variables).

If Clerk keys are missing, public pages can still load, but protected workspace routes redirect to `/sign-in`.

### Postgres / Prisma

Required for Resume and Application persistence.

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

How to configure:

1. Create a Postgres database with your provider of choice.
2. Copy the connection URL.
3. Set it as `DATABASE_URL`.
4. Run Prisma generation and migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Reference: [Prisma connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls).

For providers with pooled and direct URLs, use a migration-safe connection string locally. This project currently reads only `DATABASE_URL` from `prisma/schema.prisma`.

### OpenAI

Required only for JD Extract. Manual Application creation can still work without OpenAI if the user fills fields manually.

```env
OPENAI_API_KEY=sk-proj_...
OPENAI_MODEL_EXTRACT=gpt-5.4-nano
```

How to configure:

1. Create or open an OpenAI platform project.
2. Create an API key.
3. Put it in `OPENAI_API_KEY`.
4. Set `OPENAI_MODEL_EXTRACT` to a model available to your account that supports the Responses API and Structured Outputs.

Reference:

- [OpenAI API keys](https://platform.openai.com/settings/organization/api-keys)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

The app does not hardcode model IDs in business logic. JD Extract reads the model from `OPENAI_MODEL_EXTRACT`.

## 3. Optional / Future Configuration

These variables exist in `.env.example`, but the current Application + JD Extract slice does not require them.

### Vercel Blob

```env
BLOB_READ_WRITE_TOKEN=
```

Reserved for future PDF resume upload/storage. Not used by the current pasted-text resume or JD Extract flows.

### Future OpenAI Routes

```env
OPENAI_MODEL_GENERATE=gpt-5.4-mini
OPENAI_MODEL_REASONING=gpt-5.4
```

Reserved for later features such as generation, diagnosis, rewrite, outreach, interview review, and weekly report.

### Rate Limit / Cache

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Reserved for future per-user AI rate limits. Not used yet.

## 4. Local Runbook

Install dependencies:

```bash
pnpm install
```

Generate Prisma Client:

```bash
pnpm db:generate
```

Apply database migrations:

```bash
pnpm db:migrate
```

Run the app:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

Private pages require sign-in:

```txt
/applications
/applications/new
/resumes
/dashboard
```

## 5. Production / Vercel Setup

In Vercel Project Settings, add the same required environment variables for the correct environments:

- Production
- Preview
- Development, if using Vercel env pull/run

Required for the current app:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
DATABASE_URL=
OPENAI_API_KEY=
OPENAI_MODEL_EXTRACT=
```

Reference: [Vercel environment variables CLI](https://vercel.com/docs/cli/env).

Before using the production app, apply migrations to the production database through your deployment workflow.

## 6. Validation Commands

Run the full local validation:

```bash
pnpm check
```

This runs:

```bash
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

For database-specific checks:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## 7. Manual QA Checklist

After configuration, verify:

- Signed-out users are redirected away from `/applications`.
- Signed-in users can open `/applications`.
- `/applications` shows an empty state when no applications exist.
- `/applications/new` opens.
- Empty JD is rejected.
- A real JD can be extracted with OpenAI.
- `companyName` and `roleTitle` are editable.
- Save Application succeeds.
- Saved applications appear in the list.
- `/applications/[id]` shows original JD and extracted fields.
- Refresh keeps persisted data.
- Another user cannot access the saved application URL.
- Missing `OPENAI_API_KEY` produces a clear JD Extract error.
- `pnpm check` passes.

## 8. Common Errors

### Protected pages redirect to sign-in

Cause:

- User is signed out, or Clerk keys are missing/invalid.

Fix:

- Sign in.
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

### Prisma cannot connect

Cause:

- `DATABASE_URL` is missing, invalid, or points to an unreachable database.

Fix:

- Verify the connection string.
- Run `pnpm db:generate`.
- Run `pnpm db:migrate`.

### JD Extract returns an error

Cause:

- `OPENAI_API_KEY` missing/invalid.
- `OPENAI_MODEL_EXTRACT` missing or unavailable to the account.
- Network/API failure.
- JD text is shorter than the minimum validation length.

Fix:

- Set `OPENAI_API_KEY`.
- Set `OPENAI_MODEL_EXTRACT`.
- Use a model available to the account that supports Responses API Structured Outputs.
- Paste a full JD and retry.

### Build fails because Prisma Client is missing

Fix:

```bash
pnpm db:generate
pnpm build
```
