# Offline-First Flow

## Flow 1: Start a local session

1. The user opens the management workspace with network access.
2. The app offers local use, or defaults into local-session mode until authentication exists.
3. The app explains that local-session data stays on the current browser and device.
4. The user enters the workspace without logging in.
5. The app creates or resumes the local session.

## Flow 2: Open the workspace while offline

1. The user opens the management workspace without network access.
2. The app reads locally stored objects and collections from local-session storage.
3. The workspace renders from local data without waiting for the API.
4. The UI shows that the app is in local-session mode and that the data is device-local.
5. The user can continue browsing the local workspace.

## Flow 3: Create an object while offline

1. The user opens the create object flow while offline.
2. The user enters title, description, story, tags, and collection selection.
3. The app validates the form locally.
4. The app creates a local object record in local-session storage.
5. The object appears immediately in the workspace.
6. The UI confirms that the object is saved locally on this device.

## Flow 4: Edit an object while offline

1. The user opens an existing cached object while offline.
2. The user edits metadata fields such as title, description, story, tags, or collection.
3. The app validates the edit locally.
4. The app updates the local object record immediately.
5. The app persists the updated record in local-session storage.
6. The UI confirms that the edit is saved locally.

## Flow 5: Reload and resume the local session

1. The user closes or reloads the browser.
2. The user later opens the app again from the same browser.
3. The app restores locally stored objects and collections from local-session storage.
4. The workspace appears with the same local records as before.
5. The user continues from the previous local state without logging in.

## Flow 6: Clear the local session

1. The user opens session settings or the local workspace controls.
2. The user chooses to clear the local session.
3. The app explains that this removes local browser data for the local workspace.
4. The user confirms the action.
5. The app clears local-session storage and returns to an empty-state workspace.

## Flow 7: Export the local session to a file

1. The user opens session settings or the local workspace controls.
2. The user chooses to save the local session by file.
3. The app serializes the current local objects, collections, and session metadata into an exportable format.
4. The browser downloads the serialized session file.
5. The UI confirms that the local workspace was exported locally.

## Flow 8: Import a local session from a file

1. The user opens session settings or the local workspace controls.
2. The user chooses to restore or import from file.
3. The user selects a previously exported session file.
4. The app validates the file structure and version.
5. The app restores the local workspace data into local storage using the chosen import behavior.
6. The workspace reloads with the imported local records.

## Flow 9: Attempt media upload while offline

1. The user opens an object and tries to add media while offline.
2. The app detects that offline media upload is not part of the MVP.
3. The UI blocks the upload request and explains that uploads require connectivity or a later authenticated flow if needed.
4. The existing offline object-editing workflow remains available.

## Flow 10: Future authenticated choice

1. The product later adds authentication.
2. A user opens the app and chooses between a local session and a logged-in session.
3. The local-session flow remains local-first and account-free.
4. The logged-in flow can later add server-backed sync, sharing, and multi-device continuity.
5. The two modes remain distinct in copy and behavior so users understand where their data lives.
