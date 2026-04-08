# Checklist

Use this file to break implementation into concrete, reviewable steps.

Important rule:

- Each checklist step should represent one concrete commit
- Keep steps small enough to review cleanly
- Prefer semantic commit messages for each step
- Sequence commits so MVP delivery comes before hardening or ideal-state improvements

## Planned Commits

- [ ] `docs:` Define the feature scope and acceptance criteria
- [ ] `feat:` Add the backend foundation for the feature
- [ ] `feat:` Add the frontend flow for the feature
- [ ] `test:` Add or update automated coverage
- [ ] `chore:` Final MVP cleanup, validation, or follow-up adjustments
- [ ] `refactor:` Optional post-MVP improvements
- [ ] `chore:` Optional hardening and ideal-state follow-up

## Notes

- Remove steps that do not apply
- Add more steps when the feature is too large for a single backend or frontend commit
- If needed, split work into separate `refactor`, `fix`, or `docs` commits
- MVP steps should come first and remain shippable on their own
