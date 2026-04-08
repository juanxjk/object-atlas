import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionsModule } from './collections/collections.module';
import { DatabaseModule } from './database/database.module';
import { ObjectsModule } from './objects/objects.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
    }),
    DatabaseModule,
    StorageModule,
    CollectionsModule,
    ObjectsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
