# Tests

## MVP Test Priority

The MVP should focus on a small test set that protects the core vertical slice:

- object creation
- object update
- media upload validation
- public page retrieval
- title search

## Ideal Coverage

After MVP, coverage can expand toward:

- richer edge-case validation
- more upload scenarios
- auth and access control cases
- broader UI state coverage

## Test Strategy

- Unit tests for core backend services and validation logic
- Integration tests for API flows involving objects and media
- End-to-end tests for the main create-to-public-page flow

## Backend Cases

- Create object with valid payload
- Reject object creation with missing required fields
- Update object successfully
- Upload valid media successfully
- Reject invalid upload type or oversize file
- Fetch public object by public identifier
- Search objects by title

## Frontend Cases

- Create object form happy path
- Edit object form happy path
- Validation feedback on required fields
- Upload error and loading states
- Public object page renders correctly on mobile layout

## Manual Verification

- Create an object through the web interface
- Upload media and confirm it appears in the detail view
- Open the public object page directly
- Scan or simulate the QR destination URL on mobile-sized viewport
- Search for the created object by title

## Regression Risks

- Public page rendering can break when object fields change
- File handling can regress when storage behavior changes
- Search can regress when API filters evolve
