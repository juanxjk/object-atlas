# Collections Tests

## MVP Test Coverage

- collection creation validation
- collection update validation
- collection visibility validation for `private`, `unlisted`, and `public`
- object assignment to a valid collection
- rejection of invalid collection IDs
- object listing filtered by collection
- internal collection detail endpoint and page rendering
- public collection endpoint only returning eligible public objects for `unlisted` and `public` collections
- private collections rejecting public access
- collection QR code resolves to the expected public collection URL only for `unlisted` and `public` collections
- collection removal behavior when objects still reference it

## UI Verification

- create collection modal works on mobile and desktop widths
- object edit flow can assign and clear collection membership
- collection create and edit UI correctly reflects the selected visibility state
- collection filter changes the visible object list correctly
- internal collection page shows collection metadata and assigned object cards
- public collection page shows the grouped objects and links into individual public object pages for `unlisted` and `public` collections
- private collections do not show a public URL or QR code in the internal UI
- collection QR code appears in the intended internal entry point and targets the public collection page when allowed
- Lucide `PackageOpen` icon appears in the intended collection entry points

## Manual Checks

- create a collection and assign multiple objects
- switch a collection between `private`, `unlisted`, and `public` and confirm the public access behavior changes accordingly
- open the internal collection page and confirm the assigned objects are visible there
- open the public collection page and confirm multiple public objects appear together
- scan or inspect the collection QR code and confirm it opens the public collection page when allowed
- open the collection filter and confirm only related objects are shown
- remove an object from the collection and confirm the object itself still exists
