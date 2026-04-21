import type { CollectionRecord, CollectionSummary, ObjectRecord } from '@object-atlas/types';

export type LocalObjectFormInput = {
  collectionId: string | null;
  description: string;
  story: string;
  tags: string[];
  title: string;
};

function createLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCollectionSummary(
  collections: CollectionRecord[],
  collectionId: string | null
): CollectionSummary | null {
  if (!collectionId) {
    return null;
  }

  const collection = collections.find((candidate) => candidate.id === collectionId);

  return collection
    ? {
        description: collection.description,
        id: collection.id,
        publicId: collection.publicId,
        title: collection.title,
        visibility: collection.visibility
      }
    : null;
}

export function createLocalObjectRecord(
  input: LocalObjectFormInput,
  collections: CollectionRecord[]
): ObjectRecord {
  const id = createLocalId();
  const timestamp = new Date().toISOString();

  return {
    collection: getCollectionSummary(collections, input.collectionId),
    createdAt: timestamp,
    description: input.description || null,
    id,
    metadata: {},
    primaryFileId: null,
    publicId: `local-${id}`,
    story: input.story || null,
    tags: input.tags,
    thumbnailPath: null,
    title: input.title,
    updatedAt: timestamp
  };
}

export function updateLocalObjectRecord(
  object: ObjectRecord,
  input: LocalObjectFormInput,
  collections: CollectionRecord[]
): ObjectRecord {
  return {
    ...object,
    collection: getCollectionSummary(collections, input.collectionId),
    description: input.description || null,
    story: input.story || null,
    tags: input.tags,
    title: input.title,
    updatedAt: new Date().toISOString()
  };
}
