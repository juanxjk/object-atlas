import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { ObjectsController } from './objects.controller';
import { PublicObjectsController } from './public-objects.controller';
import { ObjectsService } from './objects.service';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [ObjectsController, PublicObjectsController],
  providers: [ObjectsService],
  exports: [ObjectsService]
})
export class ObjectsModule {}
