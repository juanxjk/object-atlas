# Checklist

Use this file to break implementation into concrete, reviewable steps.

Important rule:

- Each checklist step should represent one concrete commit
- Keep steps small enough to review cleanly
- Prefer semantic commit messages for each step
- Sequence commits so MVP delivery comes before hardening or ideal-state improvements

## Planned Commits

- [x] `docs:` Define the MVP foundation plan and acceptance criteria
- [x] `chore:` Bootstrap monorepo structure with web, api, shared packages, and Docker Compose
- [x] `feat:` Scaffold NestJS API with PostgreSQL connectivity and base object module
- [x] `feat:` Scaffold Next.js app with Tailwind CSS and mobile-first base layout
- [x] `feat:` Implement object creation and editing API endpoints
- [x] `feat:` Implement object create and edit flow in the web app
- [x] `feat:` Add filesystem-backed media storage abstraction and upload endpoint
- [x] `feat:` Add media upload UI to the object detail flow
- [ ] `feat:` Implement public object page and public object retrieval endpoint
- [ ] `feat:` Generate and display QR code linked to the public object page
- [ ] `feat:` Add basic object listing and title search in the management interface
- [ ] `test:` Add automated coverage for core object, media, and public page flows
- [ ] `chore:` Final MVP cleanup, docs, and validation pass
- [ ] `refactor:` Optional post-MVP extraction of shared contracts and UI primitives
- [ ] `chore:` Optional post-MVP hardening for auth, upload restrictions, and operational polish

## Notes

- MVP steps should remain shippable on their own
- If implementation reveals a large step, split it into smaller commits before coding
- Keep post-MVP hardening separate from the first usable release
