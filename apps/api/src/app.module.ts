import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ObjectsModule } from './objects/objects.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule, ObjectsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
