# MVP Foundation Concept

## Summary

This plan defines the first MVP implementation for ObjectAtlas. The goal is to ship the smallest useful vertical slice of the product: create an object, upload basic media, generate a QR-linked public page, and view that page on mobile web.

## Problem

ObjectAtlas needs a first implementation that proves the core product promise without overbuilding. We need a usable baseline that connects physical objects to digital profiles and public mobile pages, while keeping the scope small enough to ship quickly.

## Goals

- Enable curators or collectors to create and edit an object record
- Allow basic image and document attachments for an object
- Generate and expose a public object page that can be opened from a QR code

## Non-Goals

- Authentication or role system
- Advanced provenance editing tools
- Collections management beyond simple placeholders
- Strong hardening, audit systems, or enterprise workflows

## MVP Scope

The MVP should include:

- a mobile-first web interface
- an always-visible management navbar
- a hamburger menu for primary mobile navigation
- object create and edit flow
- object detail page for internal management
- public object page
- QR code generation linked to the public object page
- filesystem-based media uploads
- basic search by object title

## Ideal Scenario

After the MVP is working, the product can evolve toward:

- a more polished create and edit experience
- richer object metadata and story presentation
- better media handling and gallery presentation
- improved search and browsing of object records
- stronger validation and operational hardening for the same core flow

## User Flow

The primary user creates an object from a phone or desktop browser, fills in essential information, uploads one or more media files, saves the record, and receives a QR code that points to the public object page. A visitor scans the QR code and opens the public page on a mobile browser to read the object story and see its media.

## UX Notes

- The management workspace should always show a visible navbar
- Primary mobile navigation should live behind a hamburger menu
- The hamburger menu should include an object listing option
- Creating a new object should happen in a modal instead of inside the inline editor
- The create flow should be short and segmented, not one large form
- The public object page should be designed mobile-first and optimized for vertical reading
- Internal object detail should prioritize quick edits and media management
- Empty states should guide the user to add story, media, or QR code if something is missing
- Error states should be clear and actionable, especially for uploads

## Acceptance Criteria

- [ ] A user can create an object with essential fields
- [ ] A user can edit an existing object
- [ ] A user can upload at least one media file to an object
- [ ] The system generates a QR code for the object
- [ ] The QR code resolves to a public mobile-friendly object page
- [ ] A user can search objects by title in the management interface

## Open Questions

- Which exact object fields are required in the first release?
