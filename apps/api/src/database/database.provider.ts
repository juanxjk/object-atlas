import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DATABASE_DB, DATABASE_POOL } from './database.constants';
import { schema } from './schema';

export const databasePoolProvider: Provider = {
  provide: DATABASE_POOL,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;

    return new Pool({
      connectionString
    });
  }
};

export const databaseDrizzleProvider: Provider = {
  provide: DATABASE_DB,
  inject: [DATABASE_POOL],
  useFactory: (pool: Pool) => drizzle(pool, { schema })
};
