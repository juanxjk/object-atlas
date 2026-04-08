import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit
} from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service';
import { mapObjectRow } from '../objects/object.mapper';
import type { ObjectRecord } from '../objects/object.types';
import { mapCollectionRow } from './collection.mapper';
import {
  CollectionRecord,
  CollectionWithObjectsRecord,
  CreateCollectionInput,
  PublicCollectionRecord,
  UpdateCollectionInput
} from './collection.types';
import { ensureCollectionsSchema } from './collections.schema';

type DatabaseCollectionRow = {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  created_at: Date | string;
  updated_at: Date | string;
};

type DatabaseObjectRow = {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  story: string | null;
  tags: string[] | null;
  primary_file_id: string | null;
  thumbnail_path?: string | null;
  collection_id?: string | null;
  collection_public_id?: string | null;
  collection_title?: string | null;
  collection_description?: string | null;
  collection_visibility?: 'private' | 'unlisted' | 'public' | null;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
  updated_at: Date | string;
};

@Injectable()
export class CollectionsService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    await ensureCollectionsSchema(this.databaseService.getDb());
  }

  private objectSelectSql() {
    return sql`
      SELECT
        objects.*,
        COALESCE(
          primary_file.storage_path,
          (
            SELECT files.storage_path
            FROM object_files
            INNER JOIN files ON files.id = object_files.file_id
            WHERE object_files.object_id = objects.id
              AND files.mime_type LIKE 'image/%'
            ORDER BY object_files.created_at ASC
            LIMIT 1
          )
        ) AS thumbnail_path,
        collections.id AS collection_id,
        collections.public_id AS collection_public_id,
        collections.title AS collection_title,
        collections.description AS collection_description,
        collections.visibility AS collection_visibility
    `;
  }

  async ensureCollectionExists(id: string): Promise<void> {
    const db = this.databaseService.getDb();
    const result = await db.execute<{ id: string }>(sql`
      SELECT id
      FROM collections
      WHERE id = ${id}
      LIMIT 1
    `);

    if (!result.rows[0]) {
      throw new BadRequestException(`collection ${id} was not found`);
    }
  }

  async create(input: CreateCollectionInput): Promise<CollectionRecord> {
    const db = this.databaseService.getDb();
    const id = randomUUID();
    const publicId = randomUUID();
    const result = await db.execute<DatabaseCollectionRow>(sql`
      INSERT INTO collections (
        id,
        public_id,
        title,
        description,
        visibility
      )
      VALUES (
        ${id},
        ${publicId},
        ${input.title},
        ${input.description},
        ${input.visibility}
      )
      RETURNING *
    `);

    return mapCollectionRow(result.rows[0]);
  }

  async list(searchQuery?: string, visibility?: string): Promise<CollectionRecord[]> {
    const db = this.databaseService.getDb();
    const normalizedQuery = searchQuery?.trim();
    const normalizedVisibility = visibility?.trim();
    const hasQuery = Boolean(normalizedQuery);
    const hasVisibility = normalizedVisibility === 'private' || normalizedVisibility === 'unlisted' || normalizedVisibility === 'public';
    const result = await db.execute<DatabaseCollectionRow>(sql`
      SELECT *
      FROM collections
      WHERE (${hasQuery ? normalizedQuery : null}::text IS NULL OR title ILIKE '%' || ${
        hasQuery ? normalizedQuery : null
      } || '%')
        AND (${hasVisibility ? normalizedVisibility : null}::text IS NULL OR visibility = ${
          hasVisibility ? normalizedVisibility : null
        })
      ORDER BY updated_at DESC, title ASC
    `);

    return result.rows.map(mapCollectionRow);
  }

  async getById(id: string): Promise<CollectionWithObjectsRecord> {
    const db = this.databaseService.getDb();
    const collectionResult = await db.execute<DatabaseCollectionRow>(sql`
      SELECT *
      FROM collections
      WHERE id = ${id}
    `);
    const collection = collectionResult.rows[0];

    if (!collection) {
      throw new NotFoundException(`collection ${id} was not found`);
    }

    const objectsResult = await db.execute<DatabaseObjectRow>(sql`
      ${this.objectSelectSql()}
      FROM objects
      LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
      LEFT JOIN collections ON collections.id = objects.collection_id
      WHERE objects.collection_id = ${id}
      ORDER BY objects.updated_at DESC
    `);

    const objects = objectsResult.rows.map(mapObjectRow);

    return {
      ...mapCollectionRow(collection),
      objectCount: objects.length,
      objects
    };
  }

  async update(id: string, input: UpdateCollectionInput): Promise<CollectionRecord> {
    const current = await this.getById(id);
    const db = this.databaseService.getDb();
    const result = await db.execute<DatabaseCollectionRow>(sql`
      UPDATE collections
      SET
        title = ${input.title ?? current.title},
        description = ${input.description ?? current.description},
        visibility = ${input.visibility ?? current.visibility},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);

    return mapCollectionRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getById(id);

    if (collection.objectCount > 0) {
      throw new BadRequestException('collection cannot be deleted while objects still reference it');
    }

    await this.databaseService.getDb().execute(sql`
      DELETE FROM collections
      WHERE id = ${id}
    `);
  }

  async getPublicCollection(publicId: string): Promise<PublicCollectionRecord> {
    const db = this.databaseService.getDb();
    const collectionResult = await db.execute<DatabaseCollectionRow>(sql`
      SELECT *
      FROM collections
      WHERE public_id = ${publicId}
        AND visibility IN ('unlisted', 'public')
      LIMIT 1
    `);
    const collection = collectionResult.rows[0];

    if (!collection) {
      throw new NotFoundException(`public collection ${publicId} was not found`);
    }

    const objectsResult = await db.execute<DatabaseObjectRow>(sql`
      ${this.objectSelectSql()}
      FROM objects
      LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
      LEFT JOIN collections ON collections.id = objects.collection_id
      WHERE objects.collection_id = ${collection.id}
      ORDER BY objects.updated_at DESC
    `);

    const objects = objectsResult.rows.map((row) => {
      const object = mapObjectRow(row);

      return {
        id: object.id,
        publicId: object.publicId,
        title: object.title,
        description: object.description,
        thumbnailPath: object.thumbnailPath,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt
      };
    });

    return {
      ...mapCollectionRow(collection),
      objects
    };
  }
}
