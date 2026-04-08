# Collections Concept

## Summary

This plan introduces collections so multiple object records can be grouped under a shared container. A collection should help users organize related items, browse them together, and give public or internal structure to sets of objects that belong together.

## Problem

Right now objects only exist as standalone records. That makes it harder to represent sets, themed groups, exhibitions, inventories, or any other case where several items should be treated as one logical unit.

## Goals

- Allow users to create named collections
- Allow users to assign multiple objects into the same collection
- Let users browse objects by collection in the management interface
- Keep the MVP simple and avoid advanced hierarchy or permission rules

## Non-Goals

- Nested collections
- Public collection pages in the first implementation
- Complex sorting, ordering, or curation tools
- Per-collection permissions
- Collection-specific media galleries

## MVP Scope

The MVP should include:

- collection entity with title and optional description
- object-to-collection relationship
- create and edit collection flow
- collection listing in the management interface
- filter or browse objects by collection
- Lucide `PackageOpen` as the collection icon in the UI

## Ideal Scenario

After the MVP is stable, this feature can evolve toward:

- cover images for collections
- public collection pages
- ordering objects inside a collection
- collection metadata like period, owner, or location
- bulk add and bulk remove flows

## User Flow

The user creates a collection, gives it a title, optionally writes a short description, and then associates multiple objects with it. Later they open the collection from the management interface and use it to browse the related objects together.

## UX Notes

- Collections should feel like a lightweight grouping tool, not a separate complex product area
- The create flow should stay short and use the same modal pattern as other management actions
- Collection selection should be fast from the object edit flow
- The collection icon should use Lucide `PackageOpen` as the “treasure box” visual
- Empty states should explain that collections are for grouping related object records

## Acceptance Criteria

- [ ] A user can create a collection with a title
- [ ] A user can update a collection title and description
- [ ] A user can associate multiple objects with a collection
- [ ] A user can remove an object from a collection
- [ ] A user can browse or filter objects by collection in the management interface
- [ ] The collection UI uses Lucide `PackageOpen`

## Open Questions

- Should an object belong to only one collection in the MVP, or multiple collections?
- Should collection assignment happen from the object form, a collection form, or both in the first pass?
