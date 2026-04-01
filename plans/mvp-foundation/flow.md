# Flow

## Flow 1: Create Object and Publish Public Page

1. The user opens the management interface
2. The user opens the hamburger menu
3. The user chooses the object listing option
4. The user taps the new object action
5. The system opens a create-object modal with essential fields
6. The user enters the object title, short description, story, and basic metadata
7. The system validates the input
8. The system stores the object in PostgreSQL
9. The system closes the modal and opens the saved object detail view
10. The user uploads one or more media files from the object detail page
11. The system stores media files through the storage abstraction backed by the local filesystem
12. The user marks one image as the main image for the object
13. The system stores the selected primary file reference on the object record
14. The system generates a public identifier and QR code for the object
15. The user can open the public page directly from the object detail header
16. The system opens the public object page in a new browser tab
17. The user opens the QR quick action from the object detail page
18. The system shows the QR code and public page link on demand

## Flow 2: View Public Object Page from QR Code

1. A visitor scans the QR code attached to a physical object
2. The browser opens the public object URL
3. The system resolves the object by its public identifier
4. The system returns the public object page
5. The visitor sees the object title, story, media, and key metadata on a mobile-friendly page

## Flow 3: Open Object Listing from Mobile Navigation

1. The user opens the management interface
2. The user opens the hamburger menu
3. The user chooses the object listing option
4. The system shows the list of available object records
5. The user searches or selects an object from the list
6. The system opens the selected object detail page

## Flow 4: Edit Existing Object

1. The user opens the management interface
2. The user opens the hamburger menu
3. The user chooses the object listing option
4. The system shows the list of available object records
5. The user searches for an object by title
6. The system returns matching results
7. The user taps the edit action on an object card
8. The system opens an edit modal with the core fields already filled
9. The user updates object information and saves
10. The system validates and persists the changes
11. The system closes the modal and returns the user to the object detail view
12. The updated public object page reflects the new data

## Flow 5: Invalid Upload or Validation Failure

1. The user submits missing required data or an invalid file
2. The system rejects the request
3. The system returns a clear validation error
4. The user stays in the current flow and can correct the problem without losing unrelated form data
