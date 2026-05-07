# 02 — OpenAI API Contracts

## Current stage

JD Extract is implemented through `src/lib/ai/services/extract-jd.ts` and exposed by `POST /api/applications/extract-jd`.

Resume Parse is implemented for existing pasted-text and private PDF resume records through `src/lib/ai/services/parse-resume.ts` and exposed by `POST /api/resumes/[id]/parse`. PDF parsing uses OpenAI Responses file inputs from the stored private PDF.

Diagnosis Report is implemented for applications with an attached parsed resume through `src/lib/ai/services/generate-diagnosis.ts` and exposed by `POST /api/applications/[id]/diagnose`.

## Model routing

Use environment variables, not hardcoded model IDs:

```env
OPENAI_MODEL_EXTRACT=gpt-5.4-nano
OPENAI_MODEL_PARSE=gpt-5.4-mini
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
- Generated prose should follow the current user locale (`en` or `zh-CN`) through `src/lib/i18n/ai.ts`.
- Fact fields copied from resumes, JDs, company names, role titles, or quoted source content should preserve the original language unless the user explicitly requests translation.

## Feature contracts

### Resume parse

Status: implemented for pasted-text and private PDF API parsing with resume list/detail UI display.

Input:

```ts
{
  sourceType: "pdf" | "pasted_text";
  filePath?: string;
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

Status: implemented.

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
