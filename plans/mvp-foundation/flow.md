# Flow

## Flow 1: Create Object and Publish Public Page

1. The user opens the management interface
2. The user starts the create object flow
3. The system shows a short mobile-first form with essential fields
4. The user enters the object title, short description, story, and basic metadata
5. The user uploads one or more media files
6. The system validates the input and uploaded files
7. The system stores the object in PostgreSQL
8. The system stores media files through the storage abstraction backed by the local filesystem
9. The system generates a public identifier and QR code for the object
10. The system returns the saved object detail view
11. The user sees the object detail page with the QR code and public page link

## Flow 2: View Public Object Page from QR Code

1. A visitor scans the QR code attached to a physical object
2. The browser opens the public object URL
3. The system resolves the object by its public identifier
4. The system returns the public object page
5. The visitor sees the object title, story, media, and key metadata on a mobile-friendly page

## Flow 3: Edit Existing Object

1. The user opens the management interface
2. The user searches for an object by title
3. The system returns matching results
4. The user opens the object detail page
5. The user updates object information or uploads more media
6. The system validates and persists the changes
7. The updated public object page reflects the new data

## Flow 4: Invalid Upload or Validation Failure

1. The user submits missing required data or an invalid file
2. The system rejects the request
3. The system returns a clear validation error
4. The user stays in the current flow and can correct the problem without losing unrelated form data
