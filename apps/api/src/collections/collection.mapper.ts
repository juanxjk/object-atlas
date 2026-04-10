import { InferSelectModel } from 'drizzle-orm';

import { collectionsTable } from '../database/schema';
import { CollectionRecord, CollectionSummary } from './collection.types';

type DatabaseCollectionRow = InferSelectModel<typeof collectionsTable>;

export function mapCollectionRow(row: DatabaseCollectionRow): CollectionRecord {
  return {
    id: row.id,
    publicId: row.publicId,
    title: row.title,
    description: row.description,
    visibility: row.visibility as 'private' | 'unlisted' | 'public',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function mapCollectionSummary(row: DatabaseCollectionRow): CollectionSummary {
  return {
    id: row.id,
    publicId: row.publicId,
    title: row.title,
    description: row.description,
    visibility: row.visibility as 'private' | 'unlisted' | 'public'
  };
}
