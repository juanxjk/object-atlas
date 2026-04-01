import { describe, expect, it } from 'vitest';

import { filterObjectsByTitle } from './object-search';

const objects = [
  {
    id: '1',
    publicId: 'public-1',
    title: 'Bronze lamp',
    description: null,
    story: null,
    primaryFileId: null,
    thumbnailPath: null,
    metadata: {},
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  },
  {
    id: '2',
    publicId: 'public-2',
    title: 'Wooden chair',
    description: null,
    story: null,
    primaryFileId: null,
    thumbnailPath: null,
    metadata: {},
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z'
  }
];

describe('filterObjectsByTitle', () => {
  it('returns all objects when the query is empty', () => {
    expect(filterObjectsByTitle(objects, '')).toEqual(objects);
  });

  it('filters objects by a case-insensitive title match', () => {
    expect(filterObjectsByTitle(objects, 'lamp')).toEqual([objects[0]]);
    expect(filterObjectsByTitle(objects, 'CHAIR')).toEqual([objects[1]]);
  });
});
