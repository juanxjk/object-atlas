import type { CollectionRecord, ObjectRecord } from '@object-atlas/types';

export const LOCAL_SESSION_STORAGE_KEY = 'object-atlas.local-session';
export const LOCAL_SESSION_FORMAT = 'object-atlas.local-session';
export const LOCAL_SESSION_FORMAT_VERSION = 1;

export type LocalSessionMeta = {
  createdAt: string;
  updatedAt: string;
  version: number;
  mode: 'local';
};

export type LocalSessionSnapshot = {
  collections: CollectionRecord[];
  meta: LocalSessionMeta;
  objects: ObjectRecord[];
};

export type LocalSessionDocument = {
  format: typeof LOCAL_SESSION_FORMAT;
  exportedAt: string;
  session: LocalSessionSnapshot;
  version: typeof LOCAL_SESSION_FORMAT_VERSION;
};

export type LocalSessionSource = 'empty' | 'seed' | 'storage';
