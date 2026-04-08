# Collections Flow

## Flow 1: Create a collection

1. The user opens the collection area from the management interface.
2. The user chooses to create a new collection.
3. The system opens a modal with title and optional description fields.
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

## Flow 4: Remove an object from a collection

1. The user opens either the object edit flow or the collection detail view.
2. The user removes the object from the collection.
3. The system updates the relationship without deleting the object itself.
4. The object no longer appears inside that collection view.

## Flow 5: Empty collection state

1. The user opens a collection that has no assigned objects.
2. The system shows an empty state explaining that collections group related object records.
3. The user is prompted to assign existing objects or create new ones.
