---
name: openai-responses-api
description: Use this skill whenever implementing or reviewing OpenAI API calls, Structured Outputs, streaming, PDF/file inputs, usage tracking, moderation, or prompt templates in Prologue.
---

# OpenAI Responses API skill

## Goal

Implement OpenAI API features in a consistent, testable, schema-first way.

## Required workflow

1. Use the OpenAI developer documentation MCP server before writing API-specific code.
2. Identify the feature type:
   - structured JSON extraction
   - structured diagnosis
   - streaming text generation
   - file/PDF input
   - safety or moderation
3. Define or update a Zod schema in `src/lib/ai/schemas/`.
4. Add a prompt template in `src/lib/ai/prompts/`.
5. Implement the service function in `src/lib/ai/services/`.
6. Add validation around model output.
7. Add error handling and a deterministic fallback.
8. Store AI usage metadata when available.

## Project conventions

- Do not call OpenAI from React client components.
- Route handlers and server actions should call service modules, not SDK code directly.
- JSON-producing calls must use a schema-backed response format.
- Do not log full resumes, full JDs, or generated private content.
- Use environment variables for model routing.
- Keep prompts short, explicit, and versioned.
- Add a `promptVersion` field when persisting generated artifacts.

## Output contract checklist

Before finishing, confirm:

- The schema rejects invalid output.
- The API route returns useful error messages.
- Empty or low-quality input is handled.
- The UI can show loading, success, failure, and retry states.
- Cost and usage metadata are captured or intentionally omitted with a note.
