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
- [x] `feat:` Implement public object page and public object retrieval endpoint
- [x] `feat:` Generate and display QR code linked to the public object page
- [x] `feat:` Add basic object listing and title search in the management interface
- [x] `test:` Add automated coverage for core object, media, and public page flows
- [x] `chore:` Final MVP cleanup, docs, and validation pass
- [x] `refactor:` Optional post-MVP extraction of shared contracts and UI primitives
- [x] `chore:` Optional post-MVP hardening for auth, upload restrictions, and operational polish

## Notes

- MVP steps should remain shippable on their own
- If implementation reveals a large step, split it into smaller commits before coding
- Keep post-MVP hardening separate from the first usable release
- Runtime verification revealed a few required setup fixes: `pnpm-workspace.yaml`, local `workspace:*` package links, `@types/pg`, and explicit `ObjectsModule` imports for database and storage providers
- The management workspace now uses an always-visible navbar, with a hamburger menu only at mobile widths
- New object creation now uses a dedicated modal instead of the inline editor
- The main page now stays product-facing, while implementation context lives on a dedicated About page
- Shared site chrome now includes a lightweight footer for primary navigation and product framing
- Shared site chrome now links to the public GitHub repository for project transparency
- User-facing copy now keeps product principles implicit instead of repeating them in the UI
- Shared surfaces now rely more on borders and contrast than repeated card shadows
- Each object card now exposes an explicit edit action that opens a modal with the core fields
- The main detail pane now shows object information, attachments, and QR access without an inline edit form
- The QR code surface now opens from a quick action instead of staying expanded in the main pane
- Primary navigation and object actions now use Lucide icons instead of text-only affordances
- Object listing cards now show a thumbnail when an image attachment exists
- Create, edit, and QR modals now close when the user clicks the backdrop
- Files are now stored in a reusable file table, and objects point to a chosen primary file for thumbnails
- The API database layer now uses Drizzle schema definitions and a typed Drizzle provider
- Public object pages now present image attachments through a carousel instead of only a file list
- Object detail now includes a direct action to open the public page URL without opening the QR modal
- Filesystem uploads and `/uploads` static serving now resolve from the API package root instead of depending on the launch cwd
- Attachments can now be removed from the object detail flow, with primary-image fallback and cleanup of unreferenced files
- The current main image can also be removed directly from the attachment card without changing it first
