# Implementation

## MVP Approach

Implement the redesign primarily in the web app by introducing a clearer design-token layer, a new page-shell composition, and a lightweight client-side theme system. Keep the existing routes and business behavior intact while replacing the current visual shell with a bento-oriented layout and Base UI-backed controls.

## Ideal Evolution

After the first redesign, the implementation can evolve toward:

- a larger shared component library under `packages/ui` or a stronger shared web UI layer
- Base UI coverage for more primitives such as switches, menus, popovers, tabs, and future settings panels
- server-assisted theme hydration if needed to reduce theme flash further
- reusable bento layout primitives across public pages, admin pages, and future dashboards
- richer design tokens for semantic surface, accent, and status usage

## Frontend Scope

- Redesign the shared navigation and app shell
- Redesign the home page layout with bento-style content grouping
- Refresh surface colors, borders, spacing, and page rhythm
- Introduce a client-side theme provider or equivalent state wrapper
- Add a visible theme toggle using Base UI-backed controls
- Define light and dark theme tokens in CSS variables or a similar token layer
- Ensure the workspace continues to sit correctly inside the new shell
- Expand Base UI-backed wrappers where the redesign requires consistent interactive behavior

## Backend Scope

- No backend feature work required for the first redesign pass
- No API contract changes required unless a future iteration persists theme preferences server-side

## Data Model Impact

- No database schema changes required for the MVP redesign
- No file or storage changes required

## API Contract

- No API changes required for the MVP redesign

## Media or File Handling

- No upload or storage behavior changes required
- Existing media presentation should remain compatible with the new layout

## QR Impact

- No QR generation changes required
- Existing QR flows should remain functional inside the refreshed shell

## Rollout Notes

- Phase 1 should focus on the app shell, home page, theme tokens, and theme toggle
- Phase 2 can extend the same design system to the public object page and deeper workspace screens
- The first redesign should preserve current user flows so the release remains shippable as a front-end-only visual change

