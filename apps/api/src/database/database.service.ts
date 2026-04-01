import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DATABASE_DB, DATABASE_POOL } from './database.constants';
import type { DatabaseSchema } from './schema';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(DATABASE_DB) private readonly db: NodePgDatabase<DatabaseSchema>
  ) {}

  isConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL);
  }

  getPool(): Pool {
    return this.pool;
  }

  getDb(): NodePgDatabase<DatabaseSchema> {
    return this.db;
  }
}
