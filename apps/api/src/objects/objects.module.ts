import { Module } from '@nestjs/common';

import { ObjectsController } from './objects.controller';
import { PublicObjectsController } from './public-objects.controller';
import { ObjectsService } from './objects.service';

@Module({
  controllers: [ObjectsController, PublicObjectsController],
  providers: [ObjectsService],
  exports: [ObjectsService]
})
export class ObjectsModule {}
