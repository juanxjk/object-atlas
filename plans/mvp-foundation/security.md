# Security

## MVP Security Posture

The MVP should use practical, low-complexity protections that are enough for early development and limited usage.

- Validate required fields
- Restrict upload types and size
- Avoid exposing filesystem paths directly
- Keep management routes separate from public object routes
- Use non-guessable public identifiers instead of numeric ids for public pages

## Ideal Hardening

After the MVP, security can be improved with:

- proper authentication and role-based access
- rate limiting
- stronger upload scanning and content checks
- audit logging
- stricter ownership and visibility controls

## Access Control

- Public users can only read public object pages
- MVP management operations run without authentication
- Real user accounts and permissions are deferred until after the first vertical slice is working

## Validation

- Require title and basic descriptive content
- Validate uploaded MIME types and file size
- Reject malformed object identifiers
- Sanitize or safely render user-provided story content

## Abuse and Misuse Cases

- Oversized uploads filling local storage
- Guessing public identifiers
- Uploading unsupported or malicious files
- Publishing unintended internal metadata on public pages

## Sensitive Data Review

- The MVP should avoid storing sensitive personal data
- Ownership history and private notes should not be public by default
- Internal-only metadata should be excluded from the public page response

## Storage and Exposure

- Media files are stored on the local filesystem in MVP
- The API should control how public files are exposed
- Files should not be served by raw storage paths

## Audit Notes

- Formal audit logging is not required for MVP
- Basic server logs and clear update timestamps are enough initially
- Audit needs should be revisited when authentication is introduced
