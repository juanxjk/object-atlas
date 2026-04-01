import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

import { Injectable } from '@nestjs/common';

import { StorageService, StoreFileInput, StoredFile } from './storage.types';
import { resolveStorageRoot } from './storage-path';

@Injectable()
export class FilesystemStorageService implements StorageService {
  private readonly rootDirectory = resolveStorageRoot(process.env.STORAGE_FILESYSTEM_ROOT);

  async store(input: StoreFileInput): Promise<StoredFile> {
    const objectDirectory = join(this.rootDirectory, 'objects', input.objectId);
    await mkdir(objectDirectory, { recursive: true });

    const safeFilename = basename(input.originalFilename).trim();
    const sanitizedExtension = extname(safeFilename).replace(/[^a-zA-Z0-9.]/g, '');
    const filename = `${randomUUID()}${sanitizedExtension}`;
    const diskPath = join(objectDirectory, filename);

    await writeFile(diskPath, input.buffer);

    const relativePath = join('objects', input.objectId, basename(diskPath));

    return {
      diskPath,
      relativePath,
      filename,
      mimeType: input.mimeType,
      size: input.buffer.length
    };
  }
}
