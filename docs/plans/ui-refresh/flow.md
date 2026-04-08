# Flow

## Flow 1: User Opens the Refreshed App Shell

1. The user opens the application home page.
2. The system renders the refreshed app shell with the new layout structure, color system, and grouped sections.
3. The user sees clearer visual separation between navigation, overview content, and the object workspace.
4. The user can continue into the object listing and detail flows without any change to the underlying product behavior.

## Flow 2: User Switches Between Light and Dark Mode

1. The user opens the app and sees a theme toggle in the shared navigation area.
2. The user activates the toggle.
3. The system updates the active theme immediately without a page reload.
4. The system persists the selected theme in local browser storage.
5. On the next visit, the system restores the saved theme before or during initial render to minimize visual flashing.

## Flow 3: User Navigates the Bento-Style Home Layout

1. The user lands on the home page.
2. The system presents a bento-style layout with grouped content blocks rather than a simple stacked layout.
3. The user scans the primary product message, supporting context, and workspace entry points more quickly because the information is grouped with clearer emphasis.
4. The user chooses a navigation action or scrolls into the object workspace.

## Flow 4: User Uses Existing Workspace Actions in the Refreshed UI

1. The user opens the object listing inside the redesigned workspace shell.
2. The user searches, filters, opens, edits, or creates an object using the same application flow as before.
3. The system preserves existing functionality while presenting controls through refreshed layout sections and Base UI-backed primitives.
4. The user completes the workflow without losing access to any current MVP capability.

## Flow 5: Theme Persistence Fallback

1. The user opens the application in a browser where local persistence is unavailable or blocked.
2. The system still renders a safe default theme.
3. The user can toggle the theme for the current session.
4. If persistence cannot be stored, the system keeps the current session usable without breaking the interface.

## Notes

- The redesign flows should not require backend changes unless the implementation later introduces server-aware theme handling.
- The first rollout should preserve all current navigation and management flows while replacing the presentation layer around them.
