# Offline-First Concept

## Summary

This plan introduces an offline-first local session for ObjectAtlas so any user can start using the app without authentication and continue browsing, creating, and editing object records even when the network is slow or unavailable. The MVP should prioritize reliable local data access, explicit local-session behavior, and a clean future path to authenticated sessions.

## Problem

Right now the web app depends on live API requests for core management actions and assumes one shared backend-backed workspace. If the device loses connectivity, the user cannot reliably browse the current workspace state, create new records, or edit existing ones. There is also no concept of a local session that makes it clear the data belongs only to the current browser. That is a poor fit for phone-first use in museums, storage rooms, field work, or buildings with unstable mobile reception.

## Goals

- Let users browse recently synced objects and collections while offline
- Let any user start a local session without logging in
- Let users create and edit object metadata while offline inside that local session
- Persist local-session data across reloads and browser restarts on the same device
- Make it clear that local-session data is local to the current browser
- Let users save and restore local-session data by file
- Keep the MVP safe and understandable with explicit limits
- Avoid blocking a future authenticated session model

## Non-Goals

- Full offline parity for every feature in the first pass
- Background sync that depends on browser-specific capabilities
- Authenticated account sessions in the first pass
- Cross-device sync in the first pass
- Offline-first public object pages in the first pass
- Offline media upload in the first pass
- Publishing local-session data to a shared server in the first pass
- Complex conflict-free replicated data structures

## MVP Scope

The MVP should include:

- local persistent storage for local-session data
- startup hydration from local storage
- local object list and object detail data for the management workspace
- local collections needed by object create and edit flows
- an explicit local-session entry point or session state in the UX
- offline create object flow
- offline edit object metadata flow
- local create and local update states that do not depend on immediate server sync
- a way to clear or reset the local session
- a way to export local-session data to a portable file
- a way to import local-session data from a previously exported file
- copy and UI language that explain the current session is local and device-local

The MVP should not include:

- offline media upload
- authenticated sign-in or account management
- cross-device data sync
- background sync to a backend
- public publishing from local-session data
- offline QR generation changes
- offline public collection or public object routes

## Ideal Scenario

After the MVP is stable, this feature can evolve toward:

- a user choice between local sessions and authenticated sessions
- migration of local-session data into a logged-in account after sign-in exists
- queued media upload with local blob storage
- cached public object pages and QR landing pages
- optional installable PWA behavior
- richer session diagnostics and recovery tools

## User Flow

The user opens the app on a phone and starts a local session without creating an account. The workspace opens from local browser storage and remains available even when the network is missing. The user can create a new object or edit metadata for an existing object, and the app stores the change locally on that device. When the user returns later from the same browser, the local workspace is still there. In a future authenticated version of the product, the user will instead be able to choose between a local session and a logged-in session.

## UX Notes

- Local-session mode should be explicit, not hidden
- The workspace should remain usable without requiring an API connection
- The UI should explain that local-session data stays on the current device and browser
- Forms should confirm when a save succeeded locally
- Export and import should be framed as file save and restore, not as account sync
- The app should avoid implying a record is published, shared, or backed up remotely
- Resetting the local session should be possible without confusing it with object deletion from a shared server
- The future choice between local and logged sessions should be easy to layer on without rewriting the local-session flow

## Acceptance Criteria

- [ ] A user can start using the app without logging in
- [ ] A user can open the local-session management workspace offline
- [ ] A user can browse locally stored object records offline
- [ ] A user can browse locally stored collections offline
- [ ] A user can create an object offline and see it immediately in the local workspace
- [ ] A user can edit object metadata offline and see the updated local state immediately
- [ ] Local-session data survives reload and browser restart on the same browser
- [ ] The UI clearly explains that the session is local and device-local
- [ ] A user can export the local session to a file
- [ ] A user can import a previously exported local-session file
- [ ] A user can clear the local session intentionally
- [ ] The app does not claim media upload works offline in the MVP

## Open Questions

- Should local sessions support object delete in the MVP, or should reset be the only destructive action at first?
- Should the MVP include a first-run chooser now, or should it simply default to local-session mode until auth exists?
- Should importing a file replace the current local session, merge into it, or require the user to choose?
- Should exported files include only metadata in the MVP, or should they later support bundled media too?
- Should the first implementation use a small custom IndexedDB wrapper or introduce a dedicated client-side storage library?
