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
- [x] `feat:` Add a config page for theme exploration and selection
- [x] `feat:` Add a Base UI-backed theme selector in the shared navigation
- [x] `refactor:` Redesign the home page and shared shell with a bento-style layout
- [ ] `refactor:` Align shared surfaces and navigation styling with the new color system
- [ ] `test:` Add or update automated coverage for theme behavior and shell rendering
- [ ] `chore:` Final redesign cleanup, responsive pass, and contrast adjustments
- [ ] `refactor:` Optional post-MVP extension of the new design system to public object pages
- [ ] `chore:` Optional hardening for theme hydration and broader Base UI coverage

## Notes

- MVP should focus on shell, layout, color system, and theme behavior before deeper page restyling
- Keep existing object-management behavior intact during the first redesign pass
- If the redesign becomes too large, split shell/layout changes from workspace-surface changes into separate commits
- The first concrete deliverable after planning was a visual draft page with non-functional controls so layout direction could be reviewed before behavior was wired
- The draft exploration covered both simple object cards and multi-image object detail states before the refreshed shell moved into the live app
- The first working theme implementation landed on the draft page before the same controls moved into shared navigation and config
- Theme foundations now include both a light/dark mode and a persisted theme-family key so multiple visual directions can be tested without changing code
- Theme exploration now has a dedicated config page so the selector can live outside the draft surface while shared-navigation controls are still being designed
- The theme-family system should stay open to curated palettes, including externally provided palettes that need both light and dark variants
- The draft theme style map is now shared with the real home page so the redesign can move from exploration into the live shell without duplicating palette logic
- The home page now keeps only a compact theme-family dropdown in the navbar, while the full selector stays on the config page
- The draft route has been removed now that the refreshed shell is the primary home experience
