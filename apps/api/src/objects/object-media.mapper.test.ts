import { describe, expect, it } from 'vitest';

import { mapObjectMediaRow } from './object-media.mapper';

describe('mapObjectMediaRow', () => {
  it('maps a database media row into the API shape', () => {
    const mapped = mapObjectMediaRow({
      id: 'media-1',
      object_id: 'object-1',
      original_filename: 'lamp.jpg',
      storage_path: 'objects/object-1/lamp.jpg',
      mime_type: 'image/jpeg',
      size: 2048,
      created_at: '2026-04-01T00:00:00.000Z'
    });

    expect(mapped).toEqual({
      id: 'media-1',
      objectId: 'object-1',
      originalFilename: 'lamp.jpg',
      storagePath: 'objects/object-1/lamp.jpg',
      mimeType: 'image/jpeg',
      size: 2048,
      createdAt: '2026-04-01T00:00:00.000Z'
    });
  });
});
