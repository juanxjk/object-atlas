# Checklist

Use this file to break implementation into concrete, reviewable steps.

Important rule:

- Each checklist step should represent one concrete commit
- Keep steps small enough to review cleanly
- Prefer semantic commit messages for each step
- Sequence commits so MVP delivery comes before hardening or ideal-state improvements

## Planned Commits

- [ ] `docs:` Define collections scope, object grouping rules, and MVP constraints
- [ ] `feat:` Add Drizzle schema and API endpoints for collections
- [ ] `feat:` Extend object create and edit flows with collection assignment
- [ ] `feat:` Add collection listing or filter to the management workspace using Lucide `PackageOpen`
- [ ] `test:` Add backend and frontend coverage for collection creation and assignment
- [ ] `chore:` Final UI cleanup and responsive pass for collection flows
- [ ] `refactor:` Optional post-MVP migration from one-to-many collections to many-to-many membership

## Notes

- MVP should keep object grouping simple before adding public collection pages or nested structures
- The first implementation should prefer `objects.collection_id` over a join table unless multiple collection membership is immediately required
- The collection icon should use Lucide `PackageOpen` to match the treasure-box direction
