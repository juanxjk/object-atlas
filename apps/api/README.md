# API App

This directory contains the NestJS backend for ObjectAtlas.

Current scaffold includes:

- NestJS application entrypoint
- PostgreSQL pool provider using `DATABASE_URL`
- health endpoint
- base object module structure
- object creation, listing, retrieval, and update endpoints
- filesystem-backed media storage abstraction
- object media upload and listing endpoints
- public object retrieval by public identifier
- title-based object listing and search

Planned responsibilities:

- object CRUD APIs
- public object page data APIs
- media upload handling
- storage abstraction
- QR-related services
