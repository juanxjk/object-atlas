# Collections Implementation

## MVP Implementation Approach

Start with a simple one-to-many relationship:

- `collections` table
- `objects.collection_id` foreign key

This keeps the first implementation low-complexity and easy to browse. If multi-collection membership is needed later, the relationship can be migrated to a join table.

## Data Model

### `collections`

- `id`
- `title`
- `description` nullable
- `created_at`
- `updated_at`

### `objects`

- add `collection_id` nullable foreign key to `collections.id`

## Backend Scope

- add collection schema in Drizzle
- add collection CRUD endpoints
- extend object create/update endpoints to accept `collectionId`
- add collection-aware object listing filter
- validate collection references before saving

## Frontend Scope

- add collection listing view or collection filter in the object workspace
- add create/edit collection modal
- add collection picker to the object edit flow
- show collection label on object cards or detail views when assigned
- use Lucide `PackageOpen` wherever the collection concept is represented

## API Shape

### Collections

- `GET /api/collections`
- `POST /api/collections`
- `PATCH /api/collections/:id`
- `DELETE /api/collections/:id` only if empty in the MVP

### Objects

- extend create/update object payloads with `collectionId`
- support `GET /api/objects?collectionId=...`

## UI Notes

- Keep collections inside the existing management shell instead of introducing a second workspace
- Prefer one clear collection picker over complex drag-and-drop assignment
- Reuse existing modal and list patterns

## Ideal Follow-Up Direction

- move from `objects.collection_id` to `collection_objects`
- support object ordering inside collections
- support collection cover image and public collection presentation
