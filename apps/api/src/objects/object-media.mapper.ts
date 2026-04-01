import { ObjectMediaRecord } from './object.types';

type DatabaseObjectMediaRow = {
  id: string;
  object_id: string;
  file_id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  is_primary?: boolean;
  created_at: Date | string;
};

export function mapObjectMediaRow(row: DatabaseObjectMediaRow): ObjectMediaRecord {
  return {
    id: row.id,
    objectId: row.object_id,
    fileId: row.file_id,
    originalFilename: row.original_filename,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    size: Number(row.size),
    isPrimary: Boolean(row.is_primary),
    createdAt: new Date(row.created_at).toISOString()
  };
}
