# Collections Concept

## Summary

This plan introduces collections so multiple object records can be grouped under a shared container. A collection should help users organize related items, browse them together, and give public or internal structure to sets of objects that belong together.

## Problem

Right now objects only exist as standalone records. That makes it harder to represent sets, themed groups, exhibitions, inventories, or any other case where several items should be treated as one logical unit.

## Goals

- Allow users to create named collections
- Allow users to assign multiple objects into the same collection
- Let users browse objects by collection in the management interface
- Give internal users a dedicated collection page inside the management interface
- Allow collections to be `private`, `unlisted`, or `public`
- Give shareable collections a public page that combines multiple object records into one public presentation
- Give shareable collections a QR code that resolves to the public collection page
- Keep the MVP simple and avoid advanced hierarchy or permission rules

## Non-Goals

- Nested collections
- Complex sorting, ordering, or curation tools
- Per-collection permissions
- Collection-specific media galleries

## MVP Scope

The MVP should include:

- collection entity with title and optional description
- collection visibility with `private`, `unlisted`, and `public`
- object-to-collection relationship
- create and edit collection flow
- collection listing in the management interface
- internal collection detail page in the management interface
- public collection page that presents the collection and its assigned public objects together when visibility allows it
- collection QR code support tied to the public collection page for visible collections
- filter or browse objects by collection
- Lucide `PackageOpen` as the collection icon in the UI

## Ideal Scenario

After the MVP is stable, this feature can evolve toward:

- cover images for collections
- ordering objects inside a collection
- collection metadata like period, owner, or location
- bulk add and bulk remove flows

## User Flow

The user creates a collection, gives it a title, optionally writes a short description, chooses whether it is `private`, `unlisted`, or `public`, and then associates multiple objects with it. Later they open a dedicated internal collection page from the management interface to browse, review, and manage the related objects together. When the collection is meant to be shareable, they can also use a public collection page that combines the assigned public objects into one browsable public presentation, including a QR code that points directly to that public page.

## UX Notes

- Collections should feel like a lightweight grouping tool, not a separate complex product area
- The create flow should stay short and use the same modal pattern as other management actions
- Collection selection should be fast from the object edit flow
- The internal collection page should reuse the existing management shell and object card patterns
- The public collection page should feel like a curated grouped view of related public objects, not a separate object type
- Visibility state should be clear in the create and edit flows so users understand whether a collection is private, unlisted, or public
- QR code access for collections should reuse the same mental model as object QR flows and should only appear when the collection has a public destination
- The collection icon should use Lucide `PackageOpen` as the “treasure box” visual
- Empty states should explain that collections are for grouping related object records

## Acceptance Criteria

- [ ] A user can create a collection with a title
- [ ] A user can update a collection title and description
- [ ] A user can set a collection visibility to `private`, `unlisted`, or `public`
- [ ] A user can associate multiple objects with a collection
- [ ] A user can remove an object from a collection
- [ ] A user can open a dedicated internal collection page and browse assigned objects there
- [ ] A public visitor can open an `unlisted` or `public` collection page that combines multiple assigned public objects
- [ ] A `private` collection does not expose a public collection page
- [ ] A user can access or export a QR code for an `unlisted` or `public` collection that resolves to its public page
- [ ] A user can browse or filter objects by collection in the management interface
- [ ] The collection UI uses Lucide `PackageOpen`

## Open Questions

- Should an object belong to only one collection in the MVP, or multiple collections?
- Should collection assignment happen from the object form, a collection form, or both in the first pass?
- Should public collection pages expose unpublished or draft objects, or only objects already eligible for public display?
- Should `public` collections be discoverable in public listings while `unlisted` collections remain URL-only?
