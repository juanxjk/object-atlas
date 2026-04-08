# Feature Plan Template

Copy this folder to create a new feature plan.

Recommended format:

```text
/docs/plans
  /public-object-page
    concept.md
    implementation.md
    security.md
    tests.md
    checklist.md
```

Each file has a distinct purpose:

- `concept.md`: product framing, goals, user flow, and UX intent
- `flow.md`: concrete end-to-end scenarios written step by step
- `implementation.md`: frontend, backend, data, API, and storage design
- `security.md`: MVP-safe security notes first, then hardening and ideal-state protections
- `tests.md`: test strategy and verification scope
- `checklist.md`: ordered implementation steps where each step should map to one concrete commit

Planning rule:

- Always define the MVP-first version before describing the ideal version
- Prefer low-complexity implementation first when it is acceptable for an MVP
- Defer stronger hardening, broader security coverage, and non-essential sophistication to later phases
