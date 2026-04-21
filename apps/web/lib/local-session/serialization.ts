import type { CollectionRecord, ObjectRecord } from '@object-atlas/types';

import {
  LOCAL_SESSION_FORMAT,
  LOCAL_SESSION_FORMAT_VERSION,
  type LocalSessionDocument,
  type LocalSessionMeta,
  type LocalSessionSnapshot
} from './types';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isObjectRecord(value: unknown): value is ObjectRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.id) &&
    isString(candidate.publicId) &&
    isString(candidate.title) &&
    (candidate.description === null || isString(candidate.description)) &&
    (candidate.story === null || isString(candidate.story)) &&
    isStringArray(candidate.tags) &&
    (candidate.primaryFileId === null || isString(candidate.primaryFileId)) &&
    (candidate.thumbnailPath === null || isString(candidate.thumbnailPath)) &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null &&
    isString(candidate.createdAt) &&
    isString(candidate.updatedAt)
  );
}

function isCollectionRecord(value: unknown): value is CollectionRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.id) &&
    isString(candidate.publicId) &&
    isString(candidate.title) &&
    (candidate.description === null || isString(candidate.description)) &&
    (candidate.visibility === 'private' ||
      candidate.visibility === 'unlisted' ||
      candidate.visibility === 'public') &&
    isString(candidate.createdAt) &&
    isString(candidate.updatedAt)
  );
}

function isLocalSessionMeta(value: unknown): value is LocalSessionMeta {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.createdAt) &&
    isString(candidate.updatedAt) &&
    candidate.version === LOCAL_SESSION_FORMAT_VERSION &&
    candidate.mode === 'local'
  );
}

function assertLocalSessionSnapshot(value: unknown): asserts value is LocalSessionSnapshot {
  if (!value || typeof value !== 'object') {
    throw new Error('Session payload must be an object');
  }

  const candidate = value as Record<string, unknown>;

  if (!Array.isArray(candidate.objects) || !candidate.objects.every(isObjectRecord)) {
    throw new Error('Session payload has invalid objects');
  }

  if (!Array.isArray(candidate.collections) || !candidate.collections.every(isCollectionRecord)) {
    throw new Error('Session payload has invalid collections');
  }

  if (!isLocalSessionMeta(candidate.meta)) {
    throw new Error('Session payload has invalid metadata');
  }
}

export function createEmptyLocalSessionSnapshot(now = new Date().toISOString()): LocalSessionSnapshot {
  return {
    collections: [],
    meta: {
      createdAt: now,
      mode: 'local',
      updatedAt: now,
      version: LOCAL_SESSION_FORMAT_VERSION
    },
    objects: []
  };
}

export function createLocalSessionSnapshot({
  collections,
  createdAt,
  now = new Date().toISOString(),
  objects
}: {
  collections: CollectionRecord[];
  createdAt?: string;
  now?: string;
  objects: ObjectRecord[];
}): LocalSessionSnapshot {
  return {
    collections,
    meta: {
      createdAt: createdAt ?? now,
      mode: 'local',
      updatedAt: now,
      version: LOCAL_SESSION_FORMAT_VERSION
    },
    objects
  };
}

export function serializeLocalSession(snapshot: LocalSessionSnapshot): string {
  const document: LocalSessionDocument = {
    exportedAt: new Date().toISOString(),
    format: LOCAL_SESSION_FORMAT,
    session: snapshot,
    version: LOCAL_SESSION_FORMAT_VERSION
  };

  return JSON.stringify(document, null, 2);
}

export function parseLocalSession(serializedSession: string): LocalSessionSnapshot {
  const parsed = JSON.parse(serializedSession) as Record<string, unknown>;

  if (parsed.format !== LOCAL_SESSION_FORMAT) {
    throw new Error('Unsupported local session file format');
  }

  if (parsed.version !== LOCAL_SESSION_FORMAT_VERSION) {
    throw new Error('Unsupported local session file version');
  }

  assertLocalSessionSnapshot(parsed.session);

  return parsed.session;
}
