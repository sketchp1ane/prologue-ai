# AI service modules

All OpenAI API calls must live under this directory once implementation begins.

Planned structure:

```txt
src/lib/ai/
  client.ts
  models.ts
  prompts/
  schemas/
  services/
  safety.ts
  usage.ts
```

Do not call OpenAI from React client components.
Do not scatter prompts inside route handlers.
Do not introduce non-OpenAI model providers.
