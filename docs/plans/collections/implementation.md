# Collections Implementation

## MVP Implementation Approach

Start with a simple one-to-many relationship:

- `collections` table
- `objects.collection_id` foreign key

This keeps the first implementation low-complexity and easy to browse. If multi-collection membership is needed later, the relationship can be migrated to a join table.

## Data Model

### `collections`

- `id`
- `public_id` or equivalent public-safe identifier for routing and QR destination
- `title`
- `description` nullable
- `visibility` enum: `private` | `unlisted` | `public`
- `created_at`
- `updated_at`

### `objects`

- add `collection_id` nullable foreign key to `collections.id`

## Backend Scope

- add collection schema in Drizzle
- add collection CRUD endpoints
- extend object create/update endpoints to accept `collectionId`
- add collection-aware object listing filter
- add collection detail read endpoint for the internal workspace
- add public collection read endpoint that returns collection metadata plus assigned public objects when visibility is `unlisted` or `public`
- block public collection access when visibility is `private`
- add collection QR payload or URL generation based on the public collection route for `unlisted` and `public` collections
- validate collection references before saving

## Frontend Scope

- add collection listing view or collection filter in the object workspace
- add internal collection detail page in the management workspace
- add visibility control to collection create and edit UI
- add public collection page that renders the collection title, description, and assigned public objects when permitted by visibility
- add collection QR code UI in the internal collection page and any existing QR card pattern that fits for `unlisted` and `public` collections
- add create/edit collection modal
- add collection picker to the object edit flow
- show collection label on object cards or detail views when assigned
- use Lucide `PackageOpen` wherever the collection concept is represented

## API Shape

### Collections

- `GET /api/collections`
- `GET /api/collections/:id`
- `POST /api/collections`
- `PATCH /api/collections/:id`
- `DELETE /api/collections/:id` only if empty in the MVP
- `GET /api/public/collections/:publicId` or equivalent public route for collection presentation
- include collection public URL or QR-ready destination in internal collection responses if that matches existing object QR patterns
- require create and update payloads to accept `visibility`

### Objects

- extend create/update object payloads with `collectionId`
- support `GET /api/objects?collectionId=...`

## UI Notes

- Keep collections inside the existing management shell instead of introducing a second workspace
- The internal collection page should behave as the primary management surface for one collection
- The public collection page should combine object cards or previews into one cohesive public browsing experience
- Visibility should be visible and editable from the internal collection page
- The QR code should resolve to the public collection page, not an internal management route
- `private` collections should not surface a public URL or QR code
- `unlisted` collections should have a public URL and QR code without being promoted in public indexes
- `public` collections should have a public URL and QR code and be eligible for public discovery if the product adds listings
- Prefer one clear collection picker over complex drag-and-drop assignment
- Reuse existing modal and list patterns

## Ideal Follow-Up Direction

- move from `objects.collection_id` to `collection_objects`
- support object ordering inside collections
- support collection cover image and richer public collection presentation
- support printable collection labels or signage formats derived from the same QR destination
