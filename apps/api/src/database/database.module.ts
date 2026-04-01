import { Module } from '@nestjs/common';

import { databaseDrizzleProvider, databasePoolProvider } from './database.provider';
import { DatabaseService } from './database.service';

@Module({
  providers: [databasePoolProvider, databaseDrizzleProvider, DatabaseService],
  exports: [databasePoolProvider, databaseDrizzleProvider, DatabaseService]
})
export class DatabaseModule {}
