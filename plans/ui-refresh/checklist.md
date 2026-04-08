# Checklist

Use this file to break implementation into concrete, reviewable steps.

Important rule:

- Each checklist step should represent one concrete commit
- Keep steps small enough to review cleanly
- Prefer semantic commit messages for each step
- Sequence commits so MVP delivery comes before hardening or ideal-state improvements

## Planned Commits

- [x] `docs:` Define the UI refresh scope, redesign goals, and acceptance criteria
- [x] `feat:` Add a draft page to explore the new layout direction before wiring behavior
- [x] `feat:` Add theme tokens and client-side light/dark theme state
- [ ] `feat:` Add a Base UI-backed theme toggle in the shared navigation
- [ ] `refactor:` Redesign the home page and shared shell with a bento-style layout
- [ ] `refactor:` Align shared surfaces and navigation styling with the new color system
- [ ] `test:` Add or update automated coverage for theme behavior and shell rendering
- [ ] `chore:` Final redesign cleanup, responsive pass, and contrast adjustments
- [ ] `refactor:` Optional post-MVP extension of the new design system to public object pages
- [ ] `chore:` Optional hardening for theme hydration and broader Base UI coverage

## Notes

- MVP should focus on shell, layout, color system, and theme behavior before deeper page restyling
- Keep existing object-management behavior intact during the first redesign pass
- If the redesign becomes too large, split shell/layout changes from workspace-surface changes into separate commits
- The first concrete deliverable after planning is a visual draft page with non-functional controls so layout direction can be reviewed before behavior is wired
- The draft page should be rich enough to evaluate layout treatment for both simple object cards and multi-image object detail states
- The first working theme implementation can land on the draft page before the same toggle is moved into the shared navigation
