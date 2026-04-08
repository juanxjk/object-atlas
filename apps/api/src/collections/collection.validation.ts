import { BadRequestException } from '@nestjs/common';
import { COLLECTION_VISIBILITY } from '@object-atlas/types';

import { COLLECTIONS_LIMITS } from '../database/schema-limits';
import { CreateCollectionInput, UpdateCollectionInput } from './collection.types';

function asRequiredTitle(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('title is required');
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestException('title is required');
  }

  if (normalized.length > COLLECTIONS_LIMITS.title) {
    throw new BadRequestException(`title must be at most ${COLLECTIONS_LIMITS.title} characters`);
  }

  return normalized;
}

function asOptionalDescription(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException('description must be a string');
  }

  const normalized = value.trim();

  if (normalized.length > COLLECTIONS_LIMITS.description) {
    throw new BadRequestException(
      `description must be at most ${COLLECTIONS_LIMITS.description} characters`
    );
  }

  return normalized;
}

function asVisibility(value: unknown): CreateCollectionInput['visibility'] {
  if (typeof value !== 'string' || !COLLECTION_VISIBILITY.includes(value as never)) {
    throw new BadRequestException('visibility must be private, unlisted, or public');
  }

  return value as CreateCollectionInput['visibility'];
}

export function validateCreateCollection(body: unknown): CreateCollectionInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('request body must be an object');
  }

  const payload = body as Record<string, unknown>;

  return {
    title: asRequiredTitle(payload.title),
    description: asOptionalDescription(payload.description),
    visibility: asVisibility(payload.visibility)
  };
}

export function validateUpdateCollection(body: unknown): UpdateCollectionInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('request body must be an object');
  }

  const payload = body as Record<string, unknown>;
  const update: UpdateCollectionInput = {};

  if ('title' in payload) {
    update.title = asRequiredTitle(payload.title);
  }

  if ('description' in payload) {
    update.description = asOptionalDescription(payload.description);
  }

  if ('visibility' in payload) {
    update.visibility = asVisibility(payload.visibility);
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestException('at least one field must be provided');
  }

  return update;
}
