---
name: semantic-commit-message
description: Draft and apply semantic commit messages for repository changes. Use when Codex is asked to prepare a commit message, suggest a commit title/body, or create a git commit that should follow conventional semantic prefixes such as feat, fix, refactor, docs, test, chore, perf, build, ci, or change and must include the active model in a Co-authored-by trailer.
---

# Semantic Commit Message

Use this skill to prepare commit messages that match the repository's semantic commit convention and AI attribution rule.

## Workflow

1. Run the repository lint command before drafting or creating a commit when code or configuration changed.
2. If a test command is lightweight and relevant, run it before committing as well.
3. Inspect the current diff or staged changes before drafting the message.
4. Choose the narrowest semantic prefix that matches the main effect of the change.
5. Write a short imperative subject line in the form `<type>: <summary>` or `<type>(<scope>): <summary>` when a clear scope exists.
6. Add a body only when it improves clarity. Keep it focused on user-visible impact or structural changes.
7. Always append a `Co-authored-by` trailer using the active model name and email identity requested by the user or required by the repo.

If lint or tests fail, surface that clearly before proposing or creating the commit. Do not imply the change is ready without mentioning failed checks.

## Prefix Selection

Use these prefixes consistently:

- `feat`: add a user-facing feature or new capability
- `fix`: correct a bug or regression
- `refactor`: restructure code without changing intended behavior
- `change`: mixed or cross-cutting changes that do not fit a narrower type cleanly
- `docs`: update documentation only
- `test`: add, move, delete, or adjust automated tests
- `chore`: maintenance work, housekeeping, or non-product repo tasks
- `perf`: improve performance characteristics
- `build`: change build tooling, packaging, or dependencies that affect builds
- `ci`: change CI workflows or automation pipelines

Prefer a more specific type over `change` when the diff has a clear primary category.

## Message Rules

- Keep the subject line concise and specific.
- Use lowercase semantic prefixes.
- Use an optional lowercase scope when it adds clarity, such as `feat(users): add profile search`.
- Prefer scopes that map to a bounded feature, app, package, module, or domain area.
- Omit the scope when the change is broad, cross-cutting, or the scope would be vague.
- Use imperative phrasing such as `refactor: simplify object query builder`.
- Do not mention file lists in the subject line unless the scope is otherwise unclear.
- Keep the body to one short paragraph or a few flat lines when needed.
- Do not invent behavior changes that are not present in the diff.
- Mention lint or test status in the response when a commit is requested.

## Co-Author Trailer

Always include a final trailer in this exact form:

```text
Co-authored-by: <Active Model Name> <model-email>
```

Determine the values in this order:

1. Use the exact name and email the user specifies in the current conversation.
2. Otherwise use the repository convention if one is documented.
3. Otherwise use the active model name and its standard commit identity for the environment.

When the user asks to "commit it", preserve the same trailer format in the actual `git commit` message.

## Examples

```text
feat: add public collection visibility filter
```

```text
feat(users): add profile search endpoint
```

```text
refactor: simplify collection query mapping

Co-authored-by: OpenAI Codex <codex@openai.com>
```

```text
test: move tests into dedicated unit and integration folders

Relocate API and web tests into app-local tests/unit directories and add
tests/integration placeholders for both apps.

Co-authored-by: OpenAI Codex <codex@openai.com>
```
