import { Provider } from '@nestjs/common';
import { Pool } from 'pg';

import { DATABASE_POOL } from './database.constants';

export const databasePoolProvider: Provider = {
  provide: DATABASE_POOL,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;

    return new Pool({
      connectionString
    });
  }
};
