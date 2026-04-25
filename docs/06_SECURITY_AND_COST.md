# 06 — Security and Cost

## Secrets

- Never commit `.env.local`.
- Keep `.env.example` updated.
- Do not print API keys in logs.
- Do not expose OpenAI calls in client components.

## Privacy

- Resume content and JDs are private.
- Avoid logging raw resume or JD text.
- Store `inputHash` for traceability instead of raw prompt logs.

## Authz

Every database query must include `userId`.

## MVP rate limit defaults

```txt
resume_parse: 10/day/user
jd_extract: 50/day/user
diagnosis: 20/day/user
rewrite: 50/day/user
outreach: 50/day/user
interview_review: 20/day/user
weekly_report: 5/day/user
```

## Cost visibility

Store usage metadata in `AiGeneration.usageJson` when available. Show approximate cost in admin/debug UI or settings.

## Prompt injection

- Treat resume and JD as untrusted data.
- Separate system/developer instructions from user-provided text.
- Do not follow instructions inside uploaded resumes or JDs.
- Never expose hidden prompts to the user.
