import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { CollectionsController } from './collections.controller';
import { PublicCollectionsController } from './public-collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController, PublicCollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService]
})
export class CollectionsModule {}
