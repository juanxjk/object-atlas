import { describe, expect, it } from 'vitest';

import { mapCollectionRow, mapCollectionSummary } from './collection.mapper';

describe('collection mapper', () => {
  describe('mapCollectionRow', () => {
    it('maps a database collection row into the API shape', () => {
      const mapped = mapCollectionRow({
        id: 'c1',
        publicId: 'pub-c1',
        title: 'Rare Items',
        description: 'A collection of rare items',
        visibility: 'public',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z')
      });

      expect(mapped).toEqual({
        id: 'c1',
        publicId: 'pub-c1',
        title: 'Rare Items',
        description: 'A collection of rare items',
        visibility: 'public',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-02T00:00:00.000Z'
      });
    });
  });

  describe('mapCollectionSummary', () => {
    it('maps a database collection row into the summary shape', () => {
      const mapped = mapCollectionSummary({
        id: 'c2',
        publicId: 'pub-c2',
        title: 'Hidden Items',
        description: null,
        visibility: 'unlisted',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z')
      });

      expect(mapped).toEqual({
        id: 'c2',
        publicId: 'pub-c2',
        title: 'Hidden Items',
        description: null,
        visibility: 'unlisted'
      });
    });
  });
});
