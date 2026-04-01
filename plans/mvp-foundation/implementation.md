# Implementation

## MVP Approach

Implement a single deployable monorepo with:

- `apps/web` for the Next.js management and public web experience
- `apps/api` for the NestJS API
- PostgreSQL for persistent object metadata
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
- Object creation and editing screens
- Object detail management screen
- Public object page routed by public identifier
- Basic search input by title
- QR code display within the object detail screen

## Backend Scope

- CRUD endpoints for objects
- Media upload endpoint tied to an object
- Endpoint or service for generating QR target URLs
- Public endpoint for resolving an object by public identifier
- Basic listing and title search endpoint

## Data Model Impact

- `objects` table
- `object_media` table
- optional simple fields for title, slug or public id, description, story, metadata summary, and timestamps
- relation between object and media records

No collections table is required in the MVP unless it becomes necessary during implementation.

## API Contract

- `POST /objects`
- `GET /objects`
- `GET /objects/:id`
- `PATCH /objects/:id`
- `POST /objects/:id/media`
- `GET /public/objects/:publicId`

Validation should remain practical and focused on obvious bad input for the MVP.

## Media or File Handling

- Use a storage service interface in the API
- Provide a filesystem implementation first
- Store media metadata in PostgreSQL
- Keep public URLs or file-serving behavior simple
- Restrict accepted file types and size with lightweight validation

## QR Impact

- Each object should receive a stable public identifier
- QR codes should point to the public object page URL
- QR image generation can be handled either on demand or persisted if that proves simpler

## Rollout Notes

- Phase 1 scope should be fully usable without authentication
- Phase 2 can introduce auth, collections, stronger validation, and storage evolution
- The first release should be shippable with a single local Docker Compose setup for API and PostgreSQL
