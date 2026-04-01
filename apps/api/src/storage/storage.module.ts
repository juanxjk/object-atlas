import { Module } from '@nestjs/common';

import { FilesystemStorageService } from './filesystem-storage.service';
import { STORAGE_SERVICE } from './storage.constants';

@Module({
  providers: [
    FilesystemStorageService,
    {
      provide: STORAGE_SERVICE,
      useExisting: FilesystemStorageService
    }
  ],
  exports: [STORAGE_SERVICE]
})
export class StorageModule {}
