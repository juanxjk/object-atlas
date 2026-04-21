import { describe, expect, it } from 'vitest';

import { mapObjectRow } from '../../../src/objects/object.mapper';

describe('mapObjectRow', () => {
  it('maps a database object row into the API shape', () => {
    const mapped = mapObjectRow({
      id: '1',
      publicId: 'public-1',
      title: 'Archive box',
      description: 'Storage box',
      story: 'Used in the first office',
      tags: ['archive', 'office'],
      primaryFileId: null,
      thumbnailPath: null,
      collectionId: null,
      collection: null,
      metadata: {
        shelf: 'A-2'
      },
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-02T00:00:00.000Z')
    });

    expect(mapped).toEqual({
      id: '1',
      publicId: 'public-1',
      title: 'Archive box',
      description: 'Storage box',
      story: 'Used in the first office',
      tags: ['archive', 'office'],
      primaryFileId: null,
      thumbnailPath: null,
      collection: null,
      metadata: {
        shelf: 'A-2'
      },
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-02T00:00:00.000Z'
    });
  });
});
