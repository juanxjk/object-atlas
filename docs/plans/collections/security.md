# Collections Security

## MVP Security Notes

- validate collection IDs before associating them to objects
- reject invalid or oversized collection titles and descriptions
- prevent deleting a collection if that would leave inconsistent object references
- keep collection assignment inside the same existing management trust model
- ensure the public collection page only exposes objects that are safe for public display
- enforce collection visibility so only `unlisted` and `public` collections are publicly reachable
- avoid leaking internal-only collection metadata through public collection responses
- ensure collection QR codes resolve only to public-safe collection routes for `unlisted` and `public` collections

## Risks

- dangling foreign keys if deletes are not handled carefully
- invalid collection references from edited object payloads
- oversized free-text fields if validation is skipped
- accidental exposure of non-public objects through the public collection page
- accidental exposure of `private` collections through predictable public URLs
- QR codes pointing to incorrect or internal-only routes

## Hardening Later

- add stronger delete rules and audit visibility
- add permission checks once auth and roles exist
- add safer migration path if multi-collection membership is introduced
- add explicit publication controls for collections if internal and public states diverge
- add public listing controls, sitemap rules, and robots behavior if `public` collections become indexable
- add printable QR exports with tamper-resistant or versioned destination handling if needed
