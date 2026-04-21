import { describe, expect, it } from 'vitest';

import { OBJECTS_LIMITS } from '../../../src/database/schema-limits';
import {
  validateCreateObject,
  validateUpdateObject
} from '../../../src/objects/object.validation';

describe('object validation', () => {
  it('accepts a valid create payload', () => {
    const payload = validateCreateObject({
      title: 'Bronze lamp',
      description: 'Desk lamp',
      story: 'Recovered from the old office',
      tags: ['lighting', 'bronze'],
      collectionId: 'collection-1',
      metadata: {
        year: 1964
      }
    });

    expect(payload).toEqual({
      title: 'Bronze lamp',
      description: 'Desk lamp',
      story: 'Recovered from the old office',
      tags: ['lighting', 'bronze'],
      collectionId: 'collection-1',
      metadata: {
        year: 1964
      }
    });
  });

  it('rejects create payloads without title', () => {
    expect(() => validateCreateObject({ description: 'Missing title' })).toThrow('title is required');
  });

  it('accepts partial update payloads', () => {
    const payload = validateUpdateObject({
      story: 'Updated story',
      tags: ['restored', 'office'],
      collectionId: null
    });

    expect(payload).toEqual({
      story: 'Updated story',
      tags: ['restored', 'office'],
      collectionId: null
    });
  });

  it('rejects empty update payloads', () => {
    expect(() => validateUpdateObject({})).toThrow('at least one field must be provided');
  });

  it('rejects titles longer than the schema limit', () => {
    expect(() =>
      validateCreateObject({
        title: 'a'.repeat(OBJECTS_LIMITS.title + 1)
      })
    ).toThrow(`title must be at most ${OBJECTS_LIMITS.title} characters`);
  });

  it('rejects descriptions longer than the schema limit', () => {
    expect(() =>
      validateUpdateObject({
        description: 'a'.repeat(OBJECTS_LIMITS.description + 1)
      })
    ).toThrow(`description must be at most ${OBJECTS_LIMITS.description} characters`);
  });

  it('rejects stories longer than the schema limit', () => {
    expect(() =>
      validateUpdateObject({
        story: 'a'.repeat(OBJECTS_LIMITS.story + 1)
      })
    ).toThrow(`story must be at most ${OBJECTS_LIMITS.story} characters`);
  });

  it('deduplicates tags case-insensitively', () => {
    expect(
      validateCreateObject({
        title: 'Bronze lamp',
        tags: ['Lighting', 'lighting', 'Bronze']
      }).tags
    ).toEqual(['Lighting', 'Bronze']);
  });

  it('rejects too many tags', () => {
    expect(() =>
      validateUpdateObject({
        tags: Array.from({ length: OBJECTS_LIMITS.tagsPerObject + 1 }, (_, index) => `tag-${index}`)
      })
    ).toThrow(`tags must contain at most ${OBJECTS_LIMITS.tagsPerObject} items`);
  });
});
