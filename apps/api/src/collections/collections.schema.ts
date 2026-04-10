import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { DatabaseSchema } from '../database/schema';
import { COLLECTIONS_LIMITS } from '../database/schema-limits';

export async function ensureCollectionsSchema(db: NodePgDatabase<DatabaseSchema>): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS collections (
      id UUID PRIMARY KEY,
      public_id VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.publicId))}) NOT NULL UNIQUE,
      title VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.title))}) NOT NULL,
      description VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.description))}),
      visibility VARCHAR(16) NOT NULL DEFAULT 'private',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    ALTER TABLE collections
    ALTER COLUMN public_id TYPE VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.publicId))}),
    ALTER COLUMN title TYPE VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.title))}),
    ALTER COLUMN description TYPE VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.description))}),
    ALTER COLUMN visibility TYPE VARCHAR(16)
  `);

  await db.execute(sql`
    ALTER TABLE collections
    ADD COLUMN IF NOT EXISTS public_id VARCHAR(${sql.raw(String(COLLECTIONS_LIMITS.publicId))})
  `);

  await db.execute(sql`
    ALTER TABLE collections
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(16) NOT NULL DEFAULT 'private'
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS collections_public_id_unique_idx
    ON collections(public_id)
  `);

  await db.execute(sql`
    UPDATE collections
    SET visibility = 'private'
    WHERE visibility NOT IN ('private', 'unlisted', 'public')
  `);
}
