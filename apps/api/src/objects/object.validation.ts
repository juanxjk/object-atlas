import { BadRequestException } from '@nestjs/common';

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

  return value.trim();
}

function asRequiredTitle(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('title is required');
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new BadRequestException('title is required');
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

  if ('metadata' in payload) {
    update.metadata = asRecord(payload.metadata);
  }

  if (Object.keys(update).length === 0) {
    throw new BadRequestException('at least one field must be provided');
  }

  return update;
}
