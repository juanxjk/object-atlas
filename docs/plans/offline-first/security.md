# Offline-First Security

## MVP Security Notes

- treat local-session storage as local-only product state, not as a trusted source for any shared backend behavior
- avoid storing sensitive secrets or credentials in offline storage
- keep local-session data limited to the current browser session store
- version and invalidate the local cache when stored data shapes change
- make clear that local-session data is not backed up and may be lost if browser storage is cleared
- provide a deliberate local-session reset flow so users can remove data from shared devices
- validate imported session files before writing them into local storage
- reject unknown or malformed serialization versions instead of partially importing them
- block offline media blob storage in the MVP to avoid uncontrolled client-side storage growth and more complex file-handling risks

## Risks

- browser-local object data can remain on shared devices after the session ends
- users may assume local-session data is synced or recoverable if copy is unclear
- imported files may contain malformed or outdated data if validation is weak
- local corruption or schema drift can break the local workspace if cache invalidation is not handled cleanly
- unsupported offline actions may appear available if the UI does not gate them explicitly

## Hardening Later

- add authenticated user-aware storage partitioning once auth exists
- add explicit sign-out cache clearing and device-level session controls
- add migration rules from local-session data into authenticated accounts
- add stronger import validation, checksums, or signed export formats if session files later carry sensitive or publishable data
- encrypt sensitive local data if the app later stores anything beyond ordinary workspace metadata
- add quota handling and cleanup strategy for larger offline datasets and media blobs
- add audit logging once edit history and user identity exist
