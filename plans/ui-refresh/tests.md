# Tests

## MVP Test Priority

The smallest useful coverage should verify that the redesign does not break the current flows and that theme toggling behaves correctly.

## Ideal Coverage

- automated checks for theme persistence and hydration behavior
- component coverage for shared shell primitives and toggles
- broader visual and interaction checks for responsive layout states

## Test Strategy

- Unit test scope:
  - theme-state helper logic
  - Base UI-backed theme toggle behavior
- Integration test scope:
  - shell renders in both theme states
  - existing workspace remains mounted and interactive
- End-to-end test scope:
  - user toggles theme
  - user navigates listing and object flows from the refreshed shell

## Backend Cases

- No backend-specific test changes required for the MVP redesign

## Frontend Cases

- Home page renders the new shell without crashing
- Theme toggle switches between light and dark states
- Saved theme is restored on refresh
- Navigation remains usable in both themes
- Object workspace still renders and existing flows remain accessible
- Mobile layout remains usable after the new bento-style arrangement

## Manual Verification

- Open the app in desktop and mobile widths
- Toggle between light and dark mode
- Refresh after changing the theme and confirm persistence
- Open the object listing, create modal, edit modal, and QR modal under both themes
- Verify the home page layout feels intentional and readable in both themes

## Regression Risks

- Theme hydration flash or mismatched initial render
- Reduced contrast in dark mode
- Layout breakage around the embedded workspace on mobile
- Base UI wrapper regressions in shared controls
