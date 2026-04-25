# 13 — Git Workflow

This project uses GitHub Flow with small, reviewable branches.

## Branches

- `main` is the protected release branch.
- Work happens on short-lived branches.
- Codex-created branches should use the `codex/` prefix.
- Use lowercase, hyphen-separated branch names.

Examples:

```txt
codex/verify-scaffold
codex/add-prisma-schema
codex/fix-ci-pnpm-version
```

## Standard Flow

1. Start from an up-to-date `main`.
2. Create a focused branch.
3. Make a small vertical change.
4. Run validation before opening a PR.
5. Push the branch.
6. Open a pull request using `.github/pull_request_template.md`.
7. Wait for CI and review.
8. Merge only after checks pass.
9. Delete the branch after merge.

Recommended commands:

```bash
git switch main
git pull --ff-only
git switch -c codex/<short-task-name>
pnpm check
git status --short
git add <changed-files>
git commit -m "type(scope): summary"
git push -u origin codex/<short-task-name>
```

## Commit Message Standard

Use Conventional Commits:

```txt
type(scope): summary
```

Rules:

- Use imperative mood: `add`, `fix`, `update`, `remove`.
- Keep the summary under 72 characters.
- Use lowercase `type`.
- Add a scope when it clarifies the affected area.
- Do not mention secrets, private resume/JD content, or raw prompts.
- Reference issues in the body or PR description, not by overloading the summary.

Allowed types:

```txt
feat      product feature
fix       bug fix
docs      documentation-only change
test      tests or fixtures
refactor  behavior-preserving code change
chore     tooling, dependencies, config, maintenance
ci        GitHub Actions or CI configuration
build     build system or package metadata
style     formatting-only change
revert    revert a previous commit
```

Good examples:

```txt
chore(init): verify scaffold checks
ci(actions): align pnpm version
docs(git): add workflow and commit standards
feat(resumes): add resume parse schema
fix(ai): handle diagnosis schema validation failure
test(applications): add stage update coverage
```

Avoid:

```txt
update stuff
fix
wip
final changes
add feature
```

## Commit Body

Use a body when the reason is not obvious:

```txt
docs(git): add workflow and commit standards

Document branch naming, PR validation, and commit message rules so
future Codex tasks follow the same GitHub Flow.
```

For breaking changes, add a footer:

```txt
BREAKING CHANGE: describe the migration required.
```

Breaking changes should be rare in this MVP.

## Pull Request Standard

Every PR should include:

- A short summary of what changed.
- Validation results from the PR template.
- Notes for risks, blocked checks, or follow-up tasks.
- Screenshots only when UI changes are intentionally included.

Do not merge a PR that:

- Fails `pnpm check`.
- Adds product features outside the active task.
- Adds OpenAI calls outside `src/lib/ai/`.
- Adds user-owned records without `userId` scoping.
- Commits `.env.local`, secrets, raw resumes, or full JDs.

## Validation

Before committing meaningful changes, run:

```bash
pnpm check
```

For Prisma/data-model tasks, also run:

```bash
pnpm db:generate
```

For release or high-risk UI tasks, add the relevant Playwright smoke test.
