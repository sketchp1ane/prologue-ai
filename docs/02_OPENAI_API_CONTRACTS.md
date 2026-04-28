# 02 — OpenAI API Contracts

## Current stage

JD Extract is implemented through `src/lib/ai/services/extract-jd.ts` and exposed by `POST /api/applications/extract-jd`. All other AI feature contracts in this document remain planned.

## Model routing

Use environment variables, not hardcoded model IDs:

```env
OPENAI_MODEL_EXTRACT=gpt-5.4-nano
OPENAI_MODEL_GENERATE=gpt-5.4-mini
OPENAI_MODEL_REASONING=gpt-5.4
```

Codex may adjust model names only after checking current OpenAI docs.

## Shared AI rules

- All calls use the OpenAI TypeScript SDK through `src/lib/ai/` modules.
- JSON outputs must follow schemas in `src/lib/ai/schemas/`.
- Prompt templates live in `src/lib/ai/prompts/`.
- Persist `promptVersion`, `model`, and usage metadata when available.
- Do not log private full text.
- Treat resume and JD content as untrusted input.

## Feature contracts

### Resume parse

Status: planned.

Input:

```ts
{
  sourceType: "pdf" | "pasted_text";
  fileId?: string;
  text?: string;
}
```

Output shape:

```ts
{
  basics: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    links: string[];
  };
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree?: string;
    major?: string;
    startDate?: string;
    endDate?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    bullets: string[];
    technologies: string[];
  }>;
}
```

### JD extract

Status: implemented.

Output includes:

```ts
{
  companyName?: string;
  roleTitle?: string;
  location?: string;
  seniority?: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  keywords: string[];
}
```

### Diagnosis

Status: planned.

Output includes:

```ts
{
  overallScore: number;
  hrThreeSecondVerdict: "strong_match" | "possible_match" | "weak_match";
  summary: string;
  strengths: string[];
  gaps: Array<{ label: string; severity: "low" | "medium" | "high"; evidence: string }>;
  recommendedActions: string[];
  bulletSuggestions: Array<{ original: string; suggestion: string; reason: string }>;
}
```

### Bullet rewrite

Status: planned.

Streaming output should produce three variants:

```ts
{
  variant: "impact" | "keyword_match" | "concise";
  rewrittenBullet: string;
  rationale: string;
}
```

## AI failure fallback

- Retry once for transient network failure.
- If schema validation fails, show retry and store failure metadata.
- If file input fails, ask user to paste resume text.
- If weekly data is insufficient, use deterministic statistics instead of AI.
