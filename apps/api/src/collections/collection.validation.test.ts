import { describe, expect, it } from 'vitest';

import { COLLECTIONS_LIMITS } from '../database/schema-limits';
import { validateCreateCollection, validateUpdateCollection } from './collection.validation';

describe('collection validation', () => {
  it('accepts a valid create payload', () => {
    expect(
      validateCreateCollection({
        title: 'Spring exhibit',
        description: 'Main floor objects',
        visibility: 'unlisted'
      })
    ).toEqual({
      title: 'Spring exhibit',
      description: 'Main floor objects',
      visibility: 'unlisted'
    });
  });

  it('rejects invalid visibility values', () => {
    expect(() =>
      validateCreateCollection({
        title: 'Spring exhibit',
        visibility: 'friends-only'
      })
    ).toThrow('visibility must be private, unlisted, or public');
  });

  it('accepts partial update payloads', () => {
    expect(
      validateUpdateCollection({
        visibility: 'public'
      })
    ).toEqual({
      visibility: 'public'
    });
  });

  it('rejects descriptions that exceed the schema limit', () => {
    expect(() =>
      validateUpdateCollection({
        description: 'a'.repeat(COLLECTIONS_LIMITS.description + 1)
      })
    ).toThrow(`description must be at most ${COLLECTIONS_LIMITS.description} characters`);
  });
});
