# Checklist

Use this file to break implementation into concrete, reviewable steps.

Important rule:

- Each checklist step should represent one concrete commit
- Keep steps small enough to review cleanly
- Prefer semantic commit messages for each step
- Sequence commits so MVP delivery comes before hardening or ideal-state improvements

## Planned Commits

- [x] `docs:` Define collections scope, object grouping rules, and MVP constraints
- [x] `feat:` Add Drizzle schema and API endpoints for collections
- [x] `feat:` Extend object create and edit flows with collection assignment
- [x] `feat:` Add collection visibility states and enforce `private`, `unlisted`, and `public` behavior
- [x] `feat:` Add internal collection listing and detail page to the management workspace using Lucide `PackageOpen`
- [x] `feat:` Add public collection page that combines assigned public objects
- [x] `feat:` Add collection QR code support for public collection pages
- [ ] `test:` Add backend and frontend coverage for collection creation, assignment, page rendering, and QR behavior
- [ ] `chore:` Final UI cleanup and responsive pass for collection flows
- [ ] `refactor:` Optional post-MVP migration from one-to-many collections to many-to-many membership

## Notes

- MVP now includes both internal and public collection pages, while still keeping grouping rules simple
- MVP also includes collection QR codes that point to public collection pages
- MVP visibility rules are `private`, `unlisted`, and `public`
- The first implementation should prefer `objects.collection_id` over a join table unless multiple collection membership is immediately required
- The collection icon should use Lucide `PackageOpen` to match the treasure-box direction
