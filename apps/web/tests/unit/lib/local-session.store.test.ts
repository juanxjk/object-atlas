import { describe, expect, it } from 'vitest';

import {
  clearLocalSessionSnapshot,
  loadLocalSessionSnapshot,
  loadOrCreateLocalSessionSnapshot,
  saveLocalSessionSnapshot,
  type StorageLike
} from '../../../lib/local-session/store';
import { createEmptyLocalSessionSnapshot } from '../../../lib/local-session/serialization';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    }
  };
}

describe('local-session store', () => {
  it('returns a stored snapshot when one already exists', () => {
    const storage = createMemoryStorage();
    const snapshot = createEmptyLocalSessionSnapshot('2026-04-02T00:00:00.000Z');

    saveLocalSessionSnapshot(snapshot, storage);

    const loaded = loadOrCreateLocalSessionSnapshot(
      {
        seedCollections: [],
        seedObjects: []
      },
      storage
    );

    expect(loaded.source).toBe('storage');
    expect(loaded.snapshot).toEqual(snapshot);
  });

  it('seeds a new snapshot when storage is empty', () => {
    const storage = createMemoryStorage();

    const loaded = loadOrCreateLocalSessionSnapshot(
      {
        seedCollections: [
          {
            createdAt: '2026-04-01T00:00:00.000Z',
            description: null,
            id: 'collection-1',
            publicId: 'public-collection-1',
            title: 'Lighting',
            updatedAt: '2026-04-01T00:00:00.000Z',
            visibility: 'private'
          }
        ],
        seedObjects: []
      },
      storage
    );

    expect(loaded.source).toBe('seed');
    expect(loaded.snapshot.collections).toHaveLength(1);
  });

  it('clears a stored snapshot', () => {
    const storage = createMemoryStorage();
    const snapshot = createEmptyLocalSessionSnapshot('2026-04-02T00:00:00.000Z');

    saveLocalSessionSnapshot(snapshot, storage);
    expect(loadLocalSessionSnapshot(storage)).toEqual(snapshot);

    clearLocalSessionSnapshot(storage);

    expect(loadLocalSessionSnapshot(storage)).toBeNull();
  });
});
