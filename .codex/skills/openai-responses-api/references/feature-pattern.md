# OpenAI feature implementation pattern

```txt
schema -> prompt -> service -> route/server action -> UI -> test -> acceptance note
```

Recommended service function shape:

```ts
export async function generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  // 1. validate input
  // 2. call OpenAI
  // 3. validate output
  // 4. return typed result + usage metadata
}
```

Recommended failure handling:

- Schema validation failed: save raw error metadata, allow retry.
- Model timeout: show retry and fallback explanation.
- Unsupported PDF: ask user to paste resume text.
- Rate limited: show remaining quota and reset time.
```
