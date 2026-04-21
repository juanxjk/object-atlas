# Checklist

Use this file to break implementation into concrete, reviewable steps.

Important rule:

- Each checklist step should represent one concrete commit
- Keep steps small enough to review cleanly
- Prefer semantic commit messages for each step
- Sequence commits so MVP delivery comes before hardening or ideal-state improvements

## Planned Commits

- [x] `docs:` Define offline-first local-session scope and future authenticated-session boundaries
- [x] `feat:` Add a browser-side persistent storage layer for local-session objects, collections, and session metadata
- [x] `feat:` Refactor the object workspace data flow to hydrate from local-session storage
- [x] `feat:` Add offline local-session object create and edit flows with local-save feedback
- [x] `feat:` Add local-session export and import through a versioned file-serialization API
- [x] `feat:` Add local-session messaging and a clear local-session reset flow
- [x] `feat:` Explicitly gate unsupported offline actions such as media upload and publishing
- [x] `test:` Add coverage for local-session persistence, file serialization, import validation, and reset behavior
- [ ] `chore:` Run a mobile-first UX pass on local-session entry, local-save messaging, file actions, and reset confirmation
- [ ] `refactor:` Optional follow-up for authenticated sessions, local-to-account migration, and offline media support

## Notes

- MVP offline-first support is local and tied to the current browser
- MVP should focus on object metadata, collection lookup, and portable file save and restore
- Authentication is intentionally deferred, but the local-session mode should not block a later logged-session path
- Public sharing, sync, and cross-device continuity belong to the future auth plan, not this MVP
