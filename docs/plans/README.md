# Plans

This folder stores feature plans that should be written before implementation begins.

Each plan should start from the folder template at [docs/plans/_template/README.md](/Users/juanxjk/git-projects/drafts/object-atlas/docs/plans/_template/README.md).

Create one folder per feature plan.

Suggested naming:

- `object-media-upload/`
- `public-object-page/`
- `qr-code-generation/`
- `collections-and-categories/`

Each feature folder should contain:

- `concept.md`
- `flow.md`
- `implementation.md`
- `security.md`
- `tests.md`
- `checklist.md`

Use these plans to define scope, UX, backend/frontend impact, security concerns, test strategy, and implementation order before code is written.

`checklist.md` is especially important:

- each checklist step should map to one concrete commit
- the checklist should represent the intended implementation sequence
- commit messages should use semantic commit prefixes

Planning mindset:

- define the MVP first
- keep MVP security and hardening practical, not exhaustive
- document the ideal version separately so it does not bloat the first implementation
