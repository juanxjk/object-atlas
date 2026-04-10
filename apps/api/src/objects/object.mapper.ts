import { InferSelectModel } from 'drizzle-orm';

import { collectionsTable, objectsTable } from '../database/schema';
import { ObjectRecord } from './object.types';

type DatabaseObjectRow = InferSelectModel<typeof objectsTable> & {
  thumbnailPath?: string | null;
  collection?: InferSelectModel<typeof collectionsTable> | null;
};

export function mapObjectRow(row: DatabaseObjectRow): ObjectRecord {
  return {
    id: row.id,
    publicId: row.publicId,
    title: row.title,
    description: row.description,
    story: row.story,
    tags: row.tags ?? [],
    primaryFileId: row.primaryFileId ?? null,
    thumbnailPath: row.thumbnailPath ?? null,
    collection:
      row.collection
        ? {
            id: row.collection.id,
            publicId: row.collection.publicId,
            title: row.collection.title,
            description: row.collection.description ?? null,
            visibility: row.collection.visibility as 'private' | 'unlisted' | 'public'
          }
        : null,
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}
