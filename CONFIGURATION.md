# Prologue Configuration Guide

This guide explains the configuration required to run the current Prologue app locally and in deployment.

Recommended deployment target for the current stage:

- Portfolio demo app, not a broad public SaaS launch.
- Vercel project: `prologue-ai`.
- Vercel-managed app, Postgres, and Blob storage.
- Preview deployment first, then production deployment behind a controlled custom-domain share.
- Manual production migration with `pnpm db:deploy`; do not run production migrations automatically in the Vercel build.

Current implemented private flows:

- Clerk-protected workspace routes
- pasted-text Resume CRUD
- private PDF resume upload/storage
- Application creation from pasted JD
- JD Extract through OpenAI Responses API
- Resume Parse through OpenAI Responses API for pasted text and PDF file inputs
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
5. For production on `https://www.diyi.page`, use Clerk live keys (`pk_live_...` and `sk_live_...`) and add both `https://www.diyi.page` and `https://diyi.page` in Clerk's production domain and redirect settings.

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
4. Run Prisma generation and local development migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Reference: [Prisma connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls).

For production or other non-development environments, apply committed migrations with:

```bash
pnpm db:deploy
```

For providers with pooled and direct URLs, use a migration-safe connection string for migration commands. This project currently reads only `DATABASE_URL` from `prisma/schema.prisma`.

### OpenAI

Required for JD Extract, Resume Parse, and Diagnosis Report. Manual Application creation and resume creation can still work without OpenAI, but AI actions will show a configuration error.

```env
OPENAI_API_KEY=sk-proj_...
OPENAI_MODEL_EXTRACT=gpt-5.4-nano
OPENAI_MODEL_PARSE=gpt-5.4-mini
OPENAI_MODEL_DIAGNOSE=gpt-5.4
OPENAI_MODEL_REASONING=gpt-5.4
```

How to configure:

1. Create or open an OpenAI platform project.
2. Create an API key.
3. Put it in `OPENAI_API_KEY`.
4. Set `OPENAI_MODEL_EXTRACT`, `OPENAI_MODEL_PARSE`, and `OPENAI_MODEL_DIAGNOSE` to models available to your account that support the Responses API and Structured Outputs. PDF Resume Parse also needs file input support.
5. For the portfolio demo deployment, use a separate OpenAI project or key with a low budget or usage alert.

Reference:

- [OpenAI API keys](https://platform.openai.com/settings/organization/api-keys)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

The app does not hardcode model IDs in business logic. JD Extract reads the model from `OPENAI_MODEL_EXTRACT`; Resume Parse reads from `OPENAI_MODEL_PARSE`; Diagnosis Report reads from `OPENAI_MODEL_DIAGNOSE`. `OPENAI_MODEL_REASONING` remains only as a legacy fallback for older diagnosis deployments.

### Vercel Blob

Required for PDF resume upload and PDF Resume Parse.

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

PDFs are uploaded with private Blob access and stored on the `Resume` record as `fileUrl` and `filePath`. When the user triggers parsing, the server reads the private PDF and sends it to OpenAI as a request-scoped file input. If PDF parsing fails, create a pasted-text resume version as the fallback.

Privacy note: uploaded resumes are private user data. Do not log PDF contents. OpenAI file inputs may be scanned by OpenAI safety systems, and PDF parsing can use more tokens than pasted text.

## 3. Optional / Future Configuration

These variables exist in `.env.example`, but the current resume/application slices do not require them.

```env
OPENAI_MODEL_GENERATE=gpt-5.4-mini
```

Reserved for later generation features such as rewrite, outreach, interview review, and weekly report.

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

Use the already linked Vercel project `prologue-ai` unless the project is intentionally recreated.

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
BLOB_READ_WRITE_TOKEN=
OPENAI_API_KEY=
OPENAI_MODEL_EXTRACT=
OPENAI_MODEL_PARSE=
OPENAI_MODEL_DIAGNOSE=
```

Optional / future:

```env
OPENAI_MODEL_GENERATE=
OPENAI_MODEL_REASONING=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Do not set `CLERK_TEST_USER_ID` in production. It is only for local development QA links.

Reference: [Vercel environment variables CLI](https://vercel.com/docs/cli/env).

Before using the production app, confirm that `DATABASE_URL` points to the intended production Postgres database, then apply committed migrations manually:

```bash
vercel env run -e production -- pnpm db:deploy
```

This project intentionally does not run `prisma migrate deploy` from the Vercel build command. Keep `build` as Prisma Client generation plus `next build`, and run production migrations only after explicit approval.

## 6. Portfolio Demo Runbook

### Before the demo

1. Confirm Vercel Postgres and Vercel Blob are provisioned for `prologue-ai`.
2. Confirm Preview and Production environment variables are set.
3. Confirm Clerk production domains and redirect URLs include the production custom domain and the Vercel production URL.
4. Confirm the OpenAI project/key has a low budget or usage alert.
5. Run:

```bash
pnpm check
```

6. Create a preview deployment:

```bash
vercel deploy
```

7. Smoke test sign-up, resume creation, private PDF upload, Resume Parse, application creation, JD Extract, resume attachment, and Diagnosis Report.

### Production launch

1. Add the existing custom domain in Vercel and complete the DNS changes.
2. Set `NEXT_PUBLIC_APP_URL` to `https://your-domain.example`.
3. Mirror the custom domain in Clerk's allowed domains and redirect configuration.
4. Apply production migrations after confirming the production database:

```bash
vercel env run -e production -- pnpm db:deploy
```

5. Deploy production:

```bash
vercel deploy --prod
```

6. Run the production smoke test from the custom domain.

### After the demo

1. Check OpenAI usage, Vercel usage, Blob objects, and database rows.
2. Remove test data if needed.
3. Close controlled access by disabling public sign-up in Clerk or rotating demo credentials/keys if the link was shared broadly.

## 7. Validation Commands

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
pnpm db:deploy
pnpm db:studio
```

Use `pnpm db:migrate` only for local development migrations. Use `pnpm db:deploy` for staging, preview, or production migration application.

## 8. Manual QA Checklist

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
- A resume can be attached to an application.
- Diagnosis Report can be generated for an application with an attached parsed resume.
- Private PDF upload writes to Blob and does not expose file contents in logs.
- Refresh keeps persisted data.
- Another user cannot access the saved application URL.
- Missing `OPENAI_API_KEY` produces a clear JD Extract error.
- `pnpm check` passes.

## 9. Common Errors

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
