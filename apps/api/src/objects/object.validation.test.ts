import { describe, expect, it } from 'vitest';

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
});
