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
- The theme-family set now includes a GitHub-inspired option for a cleaner neutral engineering-oriented visual direction
- The draft theme style map is now shared with the real home page so the redesign can move from exploration into the live shell without duplicating palette logic
- The home page now keeps only a compact theme-family dropdown in the navbar, while the full selector stays on the config page
- The shared navbar now includes both a compact theme-family dropdown and a light/dark toggle for quick theme changes without opening config
- The shared navbar chrome, quick theme controls, and nav actions should all inherit the active theme family instead of keeping fixed neutral styling
- The shared footer should inherit the active theme family too, so the app chrome feels consistent from top to bottom
- On desktop, navbar links should stay grouped separately from quick theme controls so navigation reads left-to-right and theme actions stay on the right edge
- The draft route has been removed now that the refreshed shell is the primary home experience
- Low-value shell cards should be removed when they do not communicate anything actionable, even if they looked useful in the earlier draft phase
- Shared informational pages like About should inherit the same theme system and shell language as the main app instead of keeping fixed legacy surfaces
- Config and other secondary pages should use the same themed page frame as the home shell so the shared navbar does not appear visually detached
- Theme-selector active states on the config page should preview the selected family with that family's own surface and accent colors rather than a generic highlight
- The config-page theme selector should use a vertical list layout so it reads like settings, while compact surfaces can keep the denser card layout
- The shared navbar should keep a clear Home action so secondary pages never trap the user away from the main object workspace
- User-facing shell copy should avoid internal labels like "MVP" when the same message can be expressed in product language
- The object listing and detail workspace should inherit the active theme family too, rather than keeping the earlier hardcoded clay and sand surfaces
- Interactive chips inside the live workspace, including tag filters, should use the active theme family's selected and unselected colors instead of generic shared chip styling
- Modal forms like create-object should inherit the active theme family as well, rather than falling back to fixed white and sand inputs
- QR and sharing dialogs should inherit the active theme family too, so auxiliary object actions feel part of the same interface
- Edit-object flows should use the same themed modal treatment as create-object flows so object forms feel consistent
