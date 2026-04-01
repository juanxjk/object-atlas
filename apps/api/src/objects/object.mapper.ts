import { ObjectRecord } from './object.types';

type DatabaseObjectRow = {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  story: string | null;
  primary_file_id?: string | null;
  thumbnail_path?: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export function mapObjectRow(row: DatabaseObjectRow): ObjectRecord {
  return {
    id: row.id,
    publicId: row.public_id,
    title: row.title,
    description: row.description,
    story: row.story,
    primaryFileId: row.primary_file_id ?? null,
    thumbnailPath: row.thumbnail_path ?? null,
    metadata: row.metadata ?? {},
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}
