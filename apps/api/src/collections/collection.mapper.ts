import { CollectionRecord, CollectionSummary } from './collection.types';

type DatabaseCollectionRow = {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  created_at: Date | string;
  updated_at: Date | string;
};

export function mapCollectionRow(row: DatabaseCollectionRow): CollectionRecord {
  return {
    id: row.id,
    publicId: row.public_id,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

export function mapCollectionSummary(row: DatabaseCollectionRow): CollectionSummary {
  return {
    id: row.id,
    publicId: row.public_id,
    title: row.title,
    description: row.description,
    visibility: row.visibility
  };
}
