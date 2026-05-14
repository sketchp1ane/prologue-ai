# 07 — Release Checklist

## Local

- [ ] `pnpm check` passes
- [ ] Prisma migration is committed
- [ ] `.env.example` is complete
- [ ] No secrets in git history
- [ ] Demo flow works locally
- [ ] `CONFIGURATION.md` matches the current deployment requirements
- [ ] `db:deploy` is available for non-development Prisma migrations

## Product smoke test

- [ ] Sign in
- [ ] Create resume
- [ ] Upload private PDF resume
- [ ] Parse resume
- [ ] Create application from JD
- [ ] Attach parsed resume to application
- [ ] Generate diagnosis
- [ ] Rewrite bullet
- [ ] Generate outreach
- [ ] Add interview review
- [ ] View weekly report or deterministic fallback

## Deployment

- [ ] Vercel project `prologue-ai` confirmed or intentionally replaced
- [ ] Vercel Postgres provisioned
- [ ] Vercel Blob provisioned
- [ ] Preview environment variables set
- [ ] Production environment variables set
- [ ] `CLERK_TEST_USER_ID` is not set in production
- [ ] Clerk production domains and redirects include the production domain
- [ ] OpenAI demo project/key has a budget or usage alert
- [ ] Production `DATABASE_URL` confirmed before migration
- [ ] Production migrations applied manually with `pnpm db:deploy`
- [ ] Preview smoke test passed
- [ ] Custom domain DNS configured, if used
- [ ] Production smoke test passed

## Portfolio package

- [ ] README complete
- [ ] Screenshots/GIFs added
- [ ] Demo data safe
- [ ] Known limitations listed
- [ ] Demo sharing plan is controlled and not treated as a public SaaS launch
- [ ] Post-demo usage and access review completed
