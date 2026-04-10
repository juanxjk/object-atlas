import { InferSelectModel } from 'drizzle-orm';

import { objectFilesTable, filesTable } from '../database/schema';
import { ObjectMediaRecord } from './object.types';

type DatabaseObjectMediaRow = InferSelectModel<typeof objectFilesTable> & 
  Pick<InferSelectModel<typeof filesTable>, 'originalFilename' | 'storagePath' | 'mimeType' | 'size'> & {
  isPrimary?: boolean;
};

export function mapObjectMediaRow(row: DatabaseObjectMediaRow): ObjectMediaRecord {
  return {
    id: row.id,
    objectId: row.objectId,
    fileId: row.fileId,
    originalFilename: row.originalFilename,
    storagePath: row.storagePath,
    mimeType: row.mimeType,
    size: Number(row.size),
    isPrimary: Boolean(row.isPrimary),
    createdAt: row.createdAt.toISOString()
  };
}
