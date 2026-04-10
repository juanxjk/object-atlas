# Collections Flow

## Flow 1: Create a collection

1. The user opens the collection area from the management interface.
2. The user chooses to create a new collection.
3. The system opens a modal with title, optional description, and visibility fields.
4. The user submits the form.
5. The system validates the fields, stores the collection, and shows it in the collection listing.

## Flow 2: Assign objects to a collection

1. The user opens an object edit flow.
2. The user selects a collection from the available collection list.
3. The system stores the object-to-collection relationship.
4. The object appears when browsing that collection.

## Flow 3: Browse objects by collection

1. The user opens the collection listing.
2. The user chooses one collection.
3. The system filters or scopes the object list to that collection.
4. The user browses the related object records inside the same workspace.

## Flow 4: Open an internal collection page

1. The user opens the collection listing from the management interface.
2. The user chooses a specific collection.
3. The system opens a dedicated internal collection page inside the management shell.
4. The page shows the collection title, description, and assigned objects.
5. The user browses or manages the collection from that page.

## Flow 5: Open a public collection page

1. A user or visitor opens the public URL for a collection.
2. The system verifies the collection visibility allows public access.
3. The system loads the collection title, description, and assigned public objects.
4. The page presents the grouped objects as one combined public collection experience.
5. The visitor opens individual objects from the collection page as needed.

## Flow 6: Access a collection QR code

1. The internal user opens a collection detail page in the management interface.
2. The system checks whether the collection visibility is `unlisted` or `public`.
3. The system shows a QR code option for that collection when a public destination is allowed.
4. The user copies, downloads, or scans the QR code.
5. Scanning the QR code opens the public collection page.

## Flow 7: Private collection public access attempt

1. A visitor opens the public URL for a collection marked `private`, or a user scans an outdated private-collection QR code.
2. The system denies public access.
3. The visitor sees a not-found or unavailable response without internal collection details.

## Flow 8: Remove an object from a collection

1. The user opens either the object edit flow or the collection detail view.
2. The user removes the object from the collection.
3. The system updates the relationship without deleting the object itself.
4. The object no longer appears inside that collection view.

## Flow 9: Empty collection state

1. The user opens a collection that has no assigned objects.
2. The system shows an empty state explaining that collections group related object records.
3. The user is prompted to assign existing objects or create new ones.
