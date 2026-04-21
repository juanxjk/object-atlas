# Offline-First Tests

## MVP Test Coverage

- local-session initialization and resume behavior
- local storage hydration for objects and collections
- workspace rendering from local data without network access
- offline object create adds a local record
- offline object edit updates local state
- local-session data persists across reload
- local-session export produces the expected serialized file shape
- local-session import restores valid serialized data
- invalid or outdated import files are rejected safely
- local-session reset clears local data intentionally
- local-session messaging appears in the intended UI entry points
- offline media upload is blocked with the intended message

## UI Verification

- the workspace is usable on mobile widths when the app is offline
- local-session banner or status label is visible and understandable
- create and edit forms confirm local save
- export and import controls are understandable and clearly worded
- reset-session flow is deliberate and clearly worded
- unsupported offline actions such as media upload or publishing are clearly disabled or explained

## Manual Checks

- open the workspace without logging in and confirm local-session mode is clear
- create several objects offline and reload the app
- edit a locally stored object and confirm the change persists after reload
- export the local session to file, clear the session, then import the file and confirm the records return
- try importing an invalid file and confirm the app rejects it without damaging the current local workspace
- clear the local session and confirm the local workspace resets cleanly
- create a new object while offline and confirm it survives reload
- attempt media upload while offline and confirm the app blocks it explicitly

## Tooling Notes

- unit-test the local storage layer separately from React components
- unit-test the serialization layer separately from the storage adapter
- add component tests around local-session messaging and local-save behavior where practical
- defer sync-contract tests until the authenticated session plan exists
