import type { CollectionSummary } from './collection.js';

export type ObjectRecord = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  story: string | null;
  tags: string[];
  primaryFileId: string | null;
  thumbnailPath: string | null;
  collection: CollectionSummary | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ObjectMediaRecord = {
  id: string;
  objectId: string;
  fileId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  size: number;
  isPrimary: boolean;
  createdAt: string;
};

export type PublicObjectRecord = Pick<
  ObjectRecord,
  'id' | 'publicId' | 'title' | 'description' | 'story' | 'tags' | 'createdAt' | 'updatedAt'
> & {
  media: ObjectMediaRecord[];
};

export type PublicObjectSummary = Pick<
  ObjectRecord,
  'id' | 'publicId' | 'title' | 'description' | 'thumbnailPath' | 'createdAt' | 'updatedAt'
>;
