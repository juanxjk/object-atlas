# Implementation

## MVP Approach

Implement a single deployable monorepo with:

- `apps/web` for the Next.js management and public web experience
- `apps/api` for the NestJS API
- PostgreSQL for persistent object metadata
- Drizzle schema definitions as the typed source of truth for PostgreSQL tables
- bounded varchar limits for user-facing and file metadata columns
- filesystem-backed media storage behind a storage service interface
- simple object-centric APIs without authentication in the MVP

The MVP should optimize for a working vertical slice rather than architectural completeness.

## Ideal Evolution

After the MVP, the implementation can evolve toward:

- stronger auth and role separation
- richer search and filtering
- collection and provenance modules
- S3-compatible storage provider
- clearer package boundaries for shared contracts and UI

## Frontend Scope

- Landing management page or dashboard with basic object listing
- Always-visible management navbar
- Hamburger menu for primary mobile navigation
- Object listing option inside the hamburger menu
- Dedicated About page for implementation and project-context content
- Modal-based object creation flow
- Object-card edit action opening a dedicated edit modal
- Create and edit forms surface the current text-length limits in the UI
- Object detail screen focused on reading, attachments, and QR access
- Object detail header includes a direct button to open the public page URL
- QR code surface opened from a quick action instead of always rendering inline
- Object listing cards can show a thumbnail when the record already has an image attachment
- Attachments can mark one image as the main image for object listings
- Attachments can be removed from the object detail flow, including the current main image
- Image attachments render an inline preview inside the object detail flow
- Clicking an attachment preview opens a modal with a larger image view and basic zoom controls
- Public object page routed by public identifier
- Public object page includes an image carousel when image media is available
- Basic search input by title
- QR code display within the object detail screen

## Backend Scope

- CRUD endpoints for objects
- Media upload endpoint tied to an object
- Media delete endpoint tied to an object
- Endpoint or service for generating QR target URLs
- Public endpoint for resolving an object by public identifier
- Basic listing and title search endpoint

## Data Model Impact

- `objects` table
- `files` table
- `object_files` table
- `objects.primary_file_id` foreign key pointing to the chosen main file
- optional simple fields for title, slug or public id, description, story, metadata summary, and timestamps
- relation between object and media records

No collections table is required in the MVP unless it becomes necessary during implementation.

## API Contract

- `POST /objects`
- `GET /objects`
- `GET /objects/:id`
- `PATCH /objects/:id`
- `POST /objects/:id/media`
- `PATCH /objects/:id/primary-media/:mediaId`
- `GET /public/objects/:publicId`

Validation should remain practical and focused on obvious bad input for the MVP.

## Media or File Handling

- Use a storage service interface in the API
- Provide a filesystem implementation first
- Store media metadata in PostgreSQL
- Compute a content hash for each binary so repeated uploads reuse the same stored file record
- Remove object-file relations and delete the underlying file only when no objects still reference it
- Keep public URLs or file-serving behavior simple
- Resolve the filesystem storage root relative to the API package so uploads do not depend on the shell cwd
- Restrict accepted file types and size with lightweight validation

## QR Impact

- Each object should receive a stable public identifier
- QR codes should point to the public object page URL
- QR image generation can be handled either on demand or persisted if that proves simpler

## Rollout Notes

- Phase 1 scope should be fully usable without authentication
- Phase 2 can introduce auth, collections, stronger validation, and storage evolution
- The first release should be shippable with a single local Docker Compose setup for API and PostgreSQL
