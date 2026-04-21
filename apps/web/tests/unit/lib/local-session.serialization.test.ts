import { describe, expect, it } from 'vitest';

import {
  createEmptyLocalSessionSnapshot,
  createLocalSessionSnapshot,
  parseLocalSession,
  serializeLocalSession
} from '../../../lib/local-session/serialization';

const collection = {
  createdAt: '2026-04-01T00:00:00.000Z',
  description: 'Lighting pieces',
  id: 'collection-1',
  publicId: 'public-collection-1',
  title: 'Lighting',
  updatedAt: '2026-04-01T00:00:00.000Z',
  visibility: 'private' as const
};

const objectRecord = {
  collection: {
    description: collection.description,
    id: collection.id,
    publicId: collection.publicId,
    title: collection.title,
    visibility: collection.visibility
  },
  createdAt: '2026-04-01T00:00:00.000Z',
  description: 'A portable bronze lamp',
  id: 'object-1',
  metadata: {},
  primaryFileId: null,
  publicId: 'local-object-1',
  story: null,
  tags: ['lamp'],
  thumbnailPath: null,
  title: 'Bronze lamp',
  updatedAt: '2026-04-01T00:00:00.000Z'
};

describe('local-session serialization', () => {
  it('serializes and parses a valid local-session snapshot', () => {
    const snapshot = createLocalSessionSnapshot({
      collections: [collection],
      now: '2026-04-02T00:00:00.000Z',
      objects: [objectRecord]
    });

    const parsed = parseLocalSession(serializeLocalSession(snapshot));

    expect(parsed).toEqual(snapshot);
  });

  it('creates an empty snapshot in local mode', () => {
    expect(createEmptyLocalSessionSnapshot('2026-04-02T00:00:00.000Z')).toEqual({
      collections: [],
      meta: {
        createdAt: '2026-04-02T00:00:00.000Z',
        mode: 'local',
        updatedAt: '2026-04-02T00:00:00.000Z',
        version: 1
      },
      objects: []
    });
  });

  it('rejects unsupported file formats', () => {
    expect(() =>
      parseLocalSession(
        JSON.stringify({
          format: 'different-format',
          session: {},
          version: 1
        })
      )
    ).toThrow('Unsupported local session file format');
  });

  it('rejects malformed session payloads', () => {
    expect(() =>
      parseLocalSession(
        JSON.stringify({
          format: 'object-atlas.local-session',
          session: {
            collections: [],
            meta: {
              createdAt: '2026-04-02T00:00:00.000Z',
              mode: 'local',
              updatedAt: '2026-04-02T00:00:00.000Z',
              version: 1
            },
            objects: [{ id: 'broken' }]
          },
          version: 1
        })
      )
    ).toThrow('Session payload has invalid objects');
  });
});
