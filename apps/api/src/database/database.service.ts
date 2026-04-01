import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

import { DATABASE_POOL } from './database.constants';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  isConfigured(): boolean {
    return Boolean(process.env.DATABASE_URL);
  }

  getPool(): Pool {
    return this.pool;
  }
}
