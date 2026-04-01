import { BadRequestException } from '@nestjs/common';

import { OBJECTS_LIMITS } from '../database/schema-limits';
import { CreateObjectInput, UpdateObjectInput } from './object.types';

function asRecord(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) {
    return {};
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('metadata must be an object');
  }

  return value as Record<string, unknown>;
}

function asOptionalString(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string`);
  }

  const normalized = value.trim();
  const maxLength =
    fieldName === 'description'
      ? OBJECTS_LIMITS.description
      : fieldName === 'story'
        ? OBJECTS_LIMITS.story
        : null;

  if (maxLength && normalized.length > maxLength) {
    throw new BadRequestException(`${fieldName} must be at most ${maxLength} characters`);
  }

  return normalized;
}

function asTags(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new BadRequestException('tags must be an array');
  }

  const normalizedTags = value.map((item) => {
    if (typeof item !== 'string') {
      throw new BadRequestException('tags must contain only strings');
    }

    const normalized = item.trim();

    if (!normalized) {
      throw new BadRequestException('tags cannot be empty');
    }

    if (normalized.length > OBJECTS_LIMITS.tag) {
      throw new BadRequestException(`each tag must be at most ${OBJECTS_LIMITS.tag} characters`);
    }

    return normalized;
  });

  const deduped = normalizedTags.filter(
    (tag, index, collection) =>
      collection.findIndex((candidate) => candidate.toLowerCase() === tag.toLowerCase()) === index
  );

  if (deduped.length > OBJECTS_LIMITS.tagsPerObject) {
    throw new BadRequestException(
      `tags must contain at most ${OBJECTS_LIMITS.tagsPerObject} items`
    );
  }

  return deduped;
}

function asRequiredTitle(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('title is required');
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestException('title is required');
  }

  if (normalized.length > OBJECTS_LIMITS.title) {
    throw new BadRequestException(`title must be at most ${OBJECTS_LIMITS.title} characters`);
  }

  return normalized;
}

export function validateCreateObject(body: unknown): CreateObjectInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('request body must be an object');
  }

  const payload = body as Record<string, unknown>;

  return {
    title: asRequiredTitle(payload.title),
    description: asOptionalString(payload.description, 'description'),
    story: asOptionalString(payload.story, 'story'),
    tags: asTags(payload.tags),
    metadata: asRecord(payload.metadata)
  };
}

export function validateUpdateObject(body: unknown): UpdateObjectInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('request body must be an object');
  }

  const payload = body as Record<string, unknown>;
  const update: UpdateObjectInput = {};

  if ('title' in payload) {
    update.title = asRequiredTitle(payload.title);
  }

  if ('description' in payload) {
    update.description = asOptionalString(payload.description, 'description');
  }

  if ('story' in payload) {
    update.story = asOptionalString(payload.story, 'story');
  }

  if ('tags' in payload) {
    update.tags = asTags(payload.tags);
  }

  if ('metadata' in payload) {
    update.metadata = asRecord(payload.metadata);
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestException('at least one field must be provided');
  }

  return update;
}
