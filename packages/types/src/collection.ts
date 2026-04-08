import type { ObjectRecord, PublicObjectSummary } from './object';

export const COLLECTION_VISIBILITY = ['private', 'unlisted', 'public'] as const;

export type CollectionVisibility = (typeof COLLECTION_VISIBILITY)[number];

export type CollectionRecord = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  visibility: CollectionVisibility;
  createdAt: string;
  updatedAt: string;
};

export type CollectionSummary = Pick<
  CollectionRecord,
  'id' | 'publicId' | 'title' | 'visibility'
> & {
  description: string | null;
};

export type CollectionWithObjectsRecord = CollectionRecord & {
  objectCount: number;
  objects: ObjectRecord[];
};

export type PublicCollectionRecord = Pick<
  CollectionRecord,
  'id' | 'publicId' | 'title' | 'description' | 'visibility' | 'createdAt' | 'updatedAt'
> & {
  objects: PublicObjectSummary[];
};
