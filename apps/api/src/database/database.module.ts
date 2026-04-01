import { Module } from '@nestjs/common';

import { databasePoolProvider } from './database.provider';
import { DatabaseService } from './database.service';

@Module({
  providers: [databasePoolProvider, DatabaseService],
  exports: [databasePoolProvider, DatabaseService]
})
export class DatabaseModule {}
