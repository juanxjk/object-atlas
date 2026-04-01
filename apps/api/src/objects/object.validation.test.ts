import { describe, expect, it } from 'vitest';

import { OBJECTS_LIMITS } from '../database/schema-limits';
import { validateCreateObject, validateUpdateObject } from './object.validation';

describe('object validation', () => {
  it('accepts a valid create payload', () => {
    const payload = validateCreateObject({
      title: 'Bronze lamp',
      description: 'Desk lamp',
      story: 'Recovered from the old office',
      metadata: {
        year: 1964
      }
    });

    expect(payload).toEqual({
      title: 'Bronze lamp',
      description: 'Desk lamp',
      story: 'Recovered from the old office',
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
      story: 'Updated story'
    });

    expect(payload).toEqual({
      story: 'Updated story'
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
});
