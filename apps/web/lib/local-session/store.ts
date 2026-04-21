import type { CollectionRecord, ObjectRecord } from '@object-atlas/types';

import {
  LOCAL_SESSION_STORAGE_KEY,
  type LocalSessionSnapshot,
  type LocalSessionSource
} from './types';
import {
  createEmptyLocalSessionSnapshot,
  createLocalSessionSnapshot,
  parseLocalSession,
  serializeLocalSession
} from './serialization';

export type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;

function getBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function loadLocalSessionSnapshot(storage: StorageLike | null = getBrowserStorage()): LocalSessionSnapshot | null {
  if (!storage) {
    return null;
  }

  const storedValue = storage.getItem(LOCAL_SESSION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return parseLocalSession(storedValue);
  } catch {
    return null;
  }
}

export function loadOrCreateLocalSessionSnapshot(
  {
    seedCollections,
    seedObjects
  }: {
    seedCollections: CollectionRecord[];
    seedObjects: ObjectRecord[];
  },
  storage: StorageLike | null = getBrowserStorage()
): { snapshot: LocalSessionSnapshot; source: LocalSessionSource } {
  const existingSnapshot = loadLocalSessionSnapshot(storage);

  if (existingSnapshot) {
    return {
      snapshot: existingSnapshot,
      source: 'storage'
    };
  }

  if (seedCollections.length > 0 || seedObjects.length > 0) {
    return {
      snapshot: createLocalSessionSnapshot({
        collections: seedCollections,
        objects: seedObjects
      }),
      source: 'seed'
    };
  }

  return {
    snapshot: createEmptyLocalSessionSnapshot(),
    source: 'empty'
  };
}

export function saveLocalSessionSnapshot(
  snapshot: LocalSessionSnapshot,
  storage: StorageLike | null = getBrowserStorage()
): boolean {
  if (!storage) {
    return false;
  }

  storage.setItem(LOCAL_SESSION_STORAGE_KEY, serializeLocalSession(snapshot));
  return true;
}

export function clearLocalSessionSnapshot(storage: StorageLike | null = getBrowserStorage()): boolean {
  if (!storage) {
    return false;
  }

  storage.removeItem(LOCAL_SESSION_STORAGE_KEY);
  return true;
}
