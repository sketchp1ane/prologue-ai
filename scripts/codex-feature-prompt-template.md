# Codex feature prompt template

```txt
Read AGENTS.md and these docs first:
- docs/11_CURRENT_STATE.md
- docs/00_PROJECT_BRIEF.md
- docs/01_ARCHITECTURE.md
- docs/02_OPENAI_API_CONTRACTS.md
- docs/03_DATA_MODEL.md
- docs/04_ACCEPTANCE_CRITERIA.md
- docs/05_CODEX_TASKS.md

Implement task: <TASK_ID_AND_NAME>.

Constraints:
- Use the relevant skill if applicable.
- Do not change unrelated features.
- Keep all OpenAI calls in src/lib/ai/.
- Add validation and error handling.
- Add test or manual QA note.
- Run pnpm check and summarize results.
```
```
