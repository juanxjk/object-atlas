# Offline-First Implementation

## MVP Implementation Approach

Start with a client-managed local workspace inside the Next.js app rather than changing the API contract for a sync protocol. The first pass should store the management data model locally in the browser, treat that local storage as the source of truth for local sessions, and avoid coupling the MVP to authentication or backend sync.

This keeps the MVP low-complexity:

- no server-side sync engine
- no background worker dependency
- no authentication dependency
- no multi-device identity model
- no backend account ownership rules
- minimal or no backend changes for the local-session MVP

## Data Model

### Local persistent store

- `objects`
- `collections`
- `session_meta`
- optional serialized export format built from the same local schema

### `objects` local shape

- local `id`
- metadata fields already used by the workspace
- `createdAt`
- `updatedAt`
- optional local-only status fields if needed for drafts or unsaved UI transitions

### `collections` local shape

- collection fields already needed by create and edit flows
- local `id`
- `createdAt`
- `updatedAt`

### `session_meta`

- session mode: `local`
- local session created-at timestamp
- last opened-at timestamp
- schema or cache version for invalidation
- export format version
- optional flags such as onboarding-seen or reset confirmation state

## Frontend Scope

- add a browser-only local storage module, preferably IndexedDB-backed
- add a workspace data layer that hydrates from local storage and writes changes back locally
- replace direct component-owned fetch handling in the object workspace with a data layer that can read and write local-session records
- add local-session messaging in the workspace shell
- add local-save feedback in create and edit flows
- add a reset or clear-local-session control
- add export-to-file and import-from-file controls for the local session
- keep media management UI online-only in the MVP, with explicit messaging when offline

## Backend Scope

- no backend change should be required for the local-session offline MVP
- keep the existing API available for the current online product areas that remain backend-backed
- avoid introducing a sync-specific API before authentication and logged sessions exist

## API Shape

- local-session data should not require any API endpoint
- add an internal serialization interface in the web app that can export and import local-session data as a versioned file
- existing object, collection, media, and public endpoints remain unchanged for future account-backed paths
- publishing or syncing local-session data is deferred until authenticated sessions are designed

## Storage Strategy

- use IndexedDB for durable browser-side storage because localStorage is too limited and fragile for queue-based workspace state
- version the local database so stale cached data can be migrated or cleared safely
- generate local IDs for local-session records without assuming server-issued identifiers
- store only metadata in the MVP, not large media blobs
- keep the local schema simple enough that future migration into an authenticated session is possible

## Serialization Strategy

- define one versioned local-session export shape containing:
- objects
- collections
- session metadata needed for restore
- serialize to JSON in the MVP because it is simple to inspect, version, and validate
- include an explicit format version so future schema changes can reject, migrate, or warn cleanly
- keep export and import logic in one dedicated module so browser storage and file serialization use the same canonical shape
- default import behavior should be explicit in the UX, preferably replace-current-session unless a merge mode is designed carefully

## Session Strategy

### Local-session behavior

- create or resume one local workspace per browser
- load locally stored objects and collections on startup
- persist object and collection changes immediately after successful local validation
- show clear local-session copy so the user understands the data is local-only
- allow the same local session to be saved to file and restored later

### Future authenticated path

- design copy and storage boundaries so a later authenticated mode can be introduced beside local-session mode
- do not hard-code assumptions that every record must exist on the backend
- defer account linking, sync, and conflict handling until the auth plan exists

## UI Notes

- show workspace-level copy that the session is local and tied to this browser
- show local-save confirmation so users know their changes were stored
- keep the create and edit forms mostly unchanged, but route submit logic through the offline data layer
- avoid disabling the whole UI when the app is offline
- make offline limitations explicit around media upload, publishing, and any unsupported actions
- add a clear local-session reset action somewhere that is easy to find but not easy to trigger accidentally
- place export and import in the same session area as reset, with wording that distinguishes save-to-file from local browser persistence

## Ideal Follow-Up Direction

- add a real session chooser between local and authenticated modes
- add migration from local-session records into a logged-in account
- add authenticated sync and publishing rules
- add collection create and edit parity if the MVP narrows them initially
- add object delete and media management operations
- add cached public pages through service worker or route-level caching
- introduce installable PWA support
- add richer export formats or bundled media if local-session file portability becomes important
