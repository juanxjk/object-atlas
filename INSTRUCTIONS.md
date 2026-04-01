# ObjectAtlas Instructions

This file defines the working direction for the project before implementation details are finalized.

## Product Intent

ObjectAtlas is a mobile-first web application for documenting physical objects through digital profiles and QR codes.

The product should make it easy to:

- create a digital record for a physical object
- attach story, metadata, provenance, and media
- generate a QR code for the object
- open a public object page directly from a phone

## Product Principles

- Mobile first, always
- Web only, no native apps
- Keep the core experience simple and fast
- Favor clarity over complexity
- Support rich storytelling without becoming an enterprise archive
- Avoid speculative or heavyweight features that do not improve the main workflow

## Explicit Non-Goals

Do not design the product around:

- blockchain
- complex verification systems
- overloaded enterprise workflows
- premature advanced permissions models
- infrastructure choices that force unnecessary complexity early

## Primary Features

- Object profiles
- QR code access
- Storytelling fields
- Provenance timeline
- Media attachments
- Public object pages
- Collections and categories
- Search and filters

## UX Direction

The interface should be designed for phone screens first and then adapted to larger screens.

Priorities:

- fast loading
- thumb-friendly interactions
- clean vertical flows
- short and focused forms
- easy scanning-to-view flow
- camera-friendly media upload
- readable public pages on mobile browsers

## Technical Direction

- Frontend: Next.js with Tailwind CSS
- Backend: NestJS
- Database: PostgreSQL
- Local development: Docker Compose
- Storage: filesystem first, but behind an abstraction that can later support S3-compatible storage

## Repository Shape

Expected root structure:

```text
/apps
  /web
  /api
/packages
  /ui
  /types
  /config
/docs
```

## Architectural Guidance

- Keep frontend and backend concerns separated by app
- Put shared contracts and reusable types in packages
- Treat file storage as an implementation detail behind an interface
- Design public object pages as first-class product surfaces, not secondary admin outputs
- Optimize for an MVP that can be shipped and refined quickly

## Near-Term Scope

Focus implementation on:

- object creation and editing
- object detail pages
- public QR-linked pages
- image and document attachments
- collections
- search

## Notes

If a future decision conflicts with this file, prefer the simpler path unless there is a strong product reason to expand scope.

## Commit Convention

- Always use semantic commit prefixes such as `feat`, `fix`, `refactor`, `chore`, `docs`, or `test`
- Always add a `Co-authored-by` trailer to commits made by AI
