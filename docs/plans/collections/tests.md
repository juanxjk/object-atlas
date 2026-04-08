# Collections Tests

## MVP Test Coverage

- collection creation validation
- collection update validation
- object assignment to a valid collection
- rejection of invalid collection IDs
- object listing filtered by collection
- collection removal behavior when objects still reference it

## UI Verification

- create collection modal works on mobile and desktop widths
- object edit flow can assign and clear collection membership
- collection filter changes the visible object list correctly
- Lucide `PackageOpen` icon appears in the intended collection entry points

## Manual Checks

- create a collection and assign multiple objects
- open the collection filter and confirm only related objects are shown
- remove an object from the collection and confirm the object itself still exists
