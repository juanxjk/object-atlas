import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { PublicObjectRecord } from '@object-atlas/types';

import { FILES_LIMITS, OBJECTS_LIMITS } from '../database/schema-limits';
import { DatabaseService } from '../database/database.service';
import { STORAGE_SERVICE } from '../storage/storage.constants';
import { StorageService } from '../storage/storage.types';
import { mapObjectMediaRow } from './object-media.mapper';
import { mapObjectRow } from './object.mapper';
import {
  CreateObjectInput,
  ObjectMediaRecord,
  ObjectRecord,
  UpdateObjectInput
} from './object.types';

type DatabaseObjectRow = {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  story: string | null;
  tags: string[] | null;
  primary_file_id: string | null;
  thumbnail_path?: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type DatabaseObjectMediaRow = {
  id: string;
  object_id: string;
  file_id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  is_primary?: boolean;
  created_at: Date | string;
};

type DatabaseFileRow = {
  id: string;
  original_filename: string;
  storage_path: string;
  content_hash: string | null;
  mime_type: string;
  size: number;
  created_at: Date | string;
};

@Injectable()
export class ObjectsService implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService
  ) {}

  async onModuleInit(): Promise<void> {
    const db = this.databaseService.getDb();

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS objects (
        id UUID PRIMARY KEY,
        public_id VARCHAR(${sql.raw(String(OBJECTS_LIMITS.publicId))}) NOT NULL UNIQUE,
        title VARCHAR(${sql.raw(String(OBJECTS_LIMITS.title))}) NOT NULL,
        description VARCHAR(${sql.raw(String(OBJECTS_LIMITS.description))}),
        story VARCHAR(${sql.raw(String(OBJECTS_LIMITS.story))}),
        tags VARCHAR(${sql.raw(String(OBJECTS_LIMITS.tag))})[] NOT NULL DEFAULT ARRAY[]::VARCHAR[],
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY,
        original_filename VARCHAR(${sql.raw(String(FILES_LIMITS.originalFilename))}) NOT NULL,
        storage_path VARCHAR(${sql.raw(String(FILES_LIMITS.storagePath))}) NOT NULL UNIQUE,
        content_hash VARCHAR(${sql.raw(String(FILES_LIMITS.contentHash))}),
        mime_type VARCHAR(${sql.raw(String(FILES_LIMITS.mimeType))}) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS object_media (
        id UUID PRIMARY KEY,
        object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
        original_filename VARCHAR(${sql.raw(String(FILES_LIMITS.originalFilename))}) NOT NULL,
        storage_path VARCHAR(${sql.raw(String(FILES_LIMITS.storagePath))}) NOT NULL,
        mime_type VARCHAR(${sql.raw(String(FILES_LIMITS.mimeType))}) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS object_files (
        id UUID PRIMARY KEY,
        object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (object_id, file_id)
      )
    `);

    await db.execute(sql`
      ALTER TABLE objects
      ADD COLUMN IF NOT EXISTS primary_file_id UUID REFERENCES files(id) ON DELETE SET NULL
    `);

    await db.execute(sql`
      ALTER TABLE objects
      ADD COLUMN IF NOT EXISTS tags VARCHAR(${sql.raw(String(OBJECTS_LIMITS.tag))})[] NOT NULL DEFAULT ARRAY[]::VARCHAR[]
    `);

    await db.execute(sql`
      ALTER TABLE files
      ADD COLUMN IF NOT EXISTS content_hash VARCHAR(${sql.raw(String(FILES_LIMITS.contentHash))})
    `);

    await db.execute(sql`
      ALTER TABLE objects
      ALTER COLUMN public_id TYPE VARCHAR(${sql.raw(String(OBJECTS_LIMITS.publicId))}),
      ALTER COLUMN title TYPE VARCHAR(${sql.raw(String(OBJECTS_LIMITS.title))}),
      ALTER COLUMN description TYPE VARCHAR(${sql.raw(String(OBJECTS_LIMITS.description))}),
      ALTER COLUMN story TYPE VARCHAR(${sql.raw(String(OBJECTS_LIMITS.story))})
    `);

    await db.execute(sql`
      ALTER TABLE files
      ALTER COLUMN original_filename TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.originalFilename))}),
      ALTER COLUMN storage_path TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.storagePath))}),
      ALTER COLUMN content_hash TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.contentHash))}),
      ALTER COLUMN mime_type TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.mimeType))})
    `);

    await db.execute(sql`
      ALTER TABLE object_media
      ALTER COLUMN original_filename TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.originalFilename))}),
      ALTER COLUMN storage_path TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.storagePath))}),
      ALTER COLUMN mime_type TYPE VARCHAR(${sql.raw(String(FILES_LIMITS.mimeType))})
    `);

    await db.execute(sql`
      INSERT INTO files (id, original_filename, storage_path, mime_type, size, created_at)
      SELECT id, original_filename, storage_path, mime_type, size, created_at
      FROM object_media
      ON CONFLICT (id) DO NOTHING
    `);

    await db.execute(sql`
      INSERT INTO object_files (id, object_id, file_id, created_at)
      SELECT id, object_id, id, created_at
      FROM object_media
      ON CONFLICT (id) DO NOTHING
    `);

    await db.execute(sql`
      UPDATE objects
      SET primary_file_id = first_image.file_id
      FROM (
        SELECT DISTINCT ON (object_files.object_id)
          object_files.object_id,
          object_files.file_id
        FROM object_files
        INNER JOIN files ON files.id = object_files.file_id
        WHERE files.mime_type LIKE 'image/%'
        ORDER BY object_files.object_id, object_files.created_at ASC
      ) AS first_image
      WHERE objects.id = first_image.object_id
        AND objects.primary_file_id IS NULL
    `);

    await this.backfillFileHashes();
  }

  private computeFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private async backfillFileHashes(): Promise<void> {
    const db = this.databaseService.getDb();
    const filesWithoutHash = await db.execute<DatabaseFileRow>(sql`
      SELECT id, original_filename, storage_path, content_hash, mime_type, size, created_at
      FROM files
      WHERE content_hash IS NULL
    `);

    for (const file of filesWithoutHash.rows) {
      try {
        const fileBuffer = await readFile(this.storageService.resolvePath(file.storage_path));
        const contentHash = this.computeFileHash(fileBuffer);

        await db.execute(sql`
          UPDATE files
          SET content_hash = ${contentHash}
          WHERE id = ${file.id}
        `);
      } catch {
        continue;
      }
    }
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
        ) AS thumbnail_path
    `;
  }

  getModuleStatus() {
    return {
      status: 'ready',
      module: 'objects'
    };
  }

  async create(input: CreateObjectInput): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    const id = randomUUID();
    const publicId = randomUUID();
    
    const tagsSql = input.tags && input.tags.length > 0
      ? sql`ARRAY[${sql.join(input.tags.map(t => sql`${t}`), sql`, `)}]::VARCHAR[]`
      : sql`ARRAY[]::VARCHAR[]`;

    const result = await db.execute<DatabaseObjectRow>(sql`
      INSERT INTO objects (
        id,
        public_id,
        title,
        description,
        story,
        tags,
        metadata
      )
      VALUES (
        ${id},
        ${publicId},
        ${input.title},
        ${input.description},
        ${input.story},
        ${tagsSql},
        ${JSON.stringify(input.metadata ?? {})}::jsonb
      )
      RETURNING *, NULL::text AS thumbnail_path
    `);

    return mapObjectRow(result.rows[0]);
  }

  async list(searchQuery?: string): Promise<ObjectRecord[]> {
    const db = this.databaseService.getDb();
    const normalizedQuery = searchQuery?.trim();
    const hasQuery = Boolean(normalizedQuery);
    const result = await db.execute<DatabaseObjectRow>(sql`
      ${this.objectSelectSql()}
      FROM objects
      LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
      WHERE (${hasQuery ? normalizedQuery : null}::text IS NULL OR title ILIKE '%' || ${
        hasQuery ? normalizedQuery : null
      } || '%')
      ORDER BY updated_at DESC
    `);

    return result.rows.map(mapObjectRow);
  }

  async getById(id: string): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    const result = await db.execute<DatabaseObjectRow>(sql`
      ${this.objectSelectSql()}
      FROM objects
      LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
      WHERE objects.id = ${id}
    `);

    const object = result.rows[0];

    if (!object) {
      throw new NotFoundException(`object ${id} was not found`);
    }

    return mapObjectRow(object);
  }

  async update(id: string, input: UpdateObjectInput): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    const current = await this.getById(id);
    const next = {
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      story: input.story ?? current.story,
      tags: input.tags ?? current.tags,
      metadata: input.metadata ?? current.metadata
    };

    const tagsSql = next.tags && next.tags.length > 0
      ? sql`ARRAY[${sql.join(next.tags.map(t => sql`${t}`), sql`, `)}]::VARCHAR[]`
      : sql`ARRAY[]::VARCHAR[]`;

    const result = await db.execute<DatabaseObjectRow>(sql`
      UPDATE objects
      SET
        title = ${next.title},
        description = ${next.description},
        story = ${next.story},
        tags = ${tagsSql},
        metadata = ${JSON.stringify(next.metadata ?? {})}::jsonb,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *, ${current.thumbnailPath}::text AS thumbnail_path
    `);

    return mapObjectRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const db = this.databaseService.getDb();
    await this.getById(id);

    const media = await this.listMedia(id);
    for (const item of media) {
      await this.deleteMedia(id, item.id);
    }

    await db.execute(sql`
      DELETE FROM objects
      WHERE id = ${id}
    `);
  }

  async addMedia(
    objectId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
  ): Promise<ObjectMediaRecord> {
    const db = this.databaseService.getDb();
    const object = await this.getById(objectId);
    const contentHash = this.computeFileHash(file.buffer);

    const existingFileResult = await db.execute<DatabaseFileRow>(sql`
      SELECT id, original_filename, storage_path, content_hash, mime_type, size, created_at
      FROM files
      WHERE content_hash = ${contentHash}
      LIMIT 1
    `);

    let fileId = existingFileResult.rows[0]?.id ?? null;
    let storagePath = existingFileResult.rows[0]?.storage_path ?? null;
    let mimeType = existingFileResult.rows[0]?.mime_type ?? file.mimetype;
    let size = existingFileResult.rows[0]?.size ?? file.size;
    const mediaId = randomUUID();

    if (!fileId || !storagePath) {
      const storedFile = await this.storageService.store({
        objectId,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        buffer: file.buffer
      });

      fileId = randomUUID();
      storagePath = storedFile.relativePath;
      mimeType = file.mimetype;
      size = file.size;

      await db.execute(sql`
        INSERT INTO files (
          id,
          original_filename,
          storage_path,
          content_hash,
          mime_type,
          size
        )
        VALUES (
          ${fileId},
          ${file.originalname},
          ${storagePath},
          ${contentHash},
          ${mimeType},
          ${size}
        )
      `);
    }

    const relation = await db.execute<
      Pick<DatabaseObjectMediaRow, 'id' | 'object_id' | 'file_id' | 'created_at'>
    >(sql`
      INSERT INTO object_files (
        id,
        object_id,
        file_id
      )
      VALUES (
        ${mediaId},
        ${objectId},
        ${fileId}
      )
      ON CONFLICT (object_id, file_id) DO NOTHING
      RETURNING id, object_id, file_id, created_at
    `);

    const resolvedRelation =
      relation.rows[0] ??
      (
        await db.execute<
          Pick<DatabaseObjectMediaRow, 'id' | 'object_id' | 'file_id' | 'created_at'>
        >(sql`
          SELECT id, object_id, file_id, created_at
          FROM object_files
          WHERE object_id = ${objectId}
            AND file_id = ${fileId}
          LIMIT 1
        `)
      ).rows[0];

    const shouldBecomePrimary = !object.primaryFileId && mimeType.startsWith('image/');

    if (shouldBecomePrimary) {
      await db.execute(sql`
        UPDATE objects
        SET primary_file_id = ${fileId},
            updated_at = NOW()
        WHERE id = ${objectId}
      `);
    }

    return mapObjectMediaRow({
      ...resolvedRelation,
      original_filename: existingFileResult.rows[0]?.original_filename ?? file.originalname,
      storage_path: storagePath,
      mime_type: mimeType,
      size,
      is_primary: shouldBecomePrimary
    });
  }

  async listMedia(objectId: string): Promise<ObjectMediaRecord[]> {
    const db = this.databaseService.getDb();
    await this.getById(objectId);

    const result = await db.execute<DatabaseObjectMediaRow>(sql`
      SELECT
        object_files.id,
        object_files.object_id,
        object_files.file_id,
        files.original_filename,
        files.storage_path,
        files.mime_type,
        files.size,
        object_files.created_at,
        (objects.primary_file_id = object_files.file_id) AS is_primary
      FROM object_files
      INNER JOIN files ON files.id = object_files.file_id
      INNER JOIN objects ON objects.id = object_files.object_id
      WHERE object_files.object_id = ${objectId}
      ORDER BY object_files.created_at DESC
    `);

    return result.rows.map(mapObjectMediaRow);
  }

  async setPrimaryMedia(objectId: string, mediaId: string): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    await this.getById(objectId);

    const result = await db.execute<{
      file_id: string;
      mime_type: string;
      storage_path: string;
    }>(sql`
      SELECT object_files.file_id, files.mime_type, files.storage_path
      FROM object_files
      INNER JOIN files ON files.id = object_files.file_id
      WHERE object_files.id = ${mediaId}
        AND object_files.object_id = ${objectId}
    `);

    const media = result.rows[0];

    if (!media) {
      throw new NotFoundException(`media ${mediaId} was not found for object ${objectId}`);
    }

    if (!media.mime_type.startsWith('image/')) {
      throw new NotFoundException(`media ${mediaId} is not an image`);
    }

    const updated = await db.execute<DatabaseObjectRow>(sql`
      UPDATE objects
      SET primary_file_id = ${media.file_id},
          updated_at = NOW()
      WHERE id = ${objectId}
      RETURNING *, ${media.storage_path}::text AS thumbnail_path
    `);

    return mapObjectRow(updated.rows[0]);
  }

  async deleteMedia(objectId: string, mediaId: string): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    await this.getById(objectId);

    const mediaResult = await db.execute<{
      file_id: string;
      storage_path: string;
      is_primary: boolean;
    }>(sql`
      SELECT
        object_files.file_id,
        files.storage_path,
        (objects.primary_file_id = object_files.file_id) AS is_primary
      FROM object_files
      INNER JOIN files ON files.id = object_files.file_id
      INNER JOIN objects ON objects.id = object_files.object_id
      WHERE object_files.id = ${mediaId}
        AND object_files.object_id = ${objectId}
    `);

    const media = mediaResult.rows[0];

    if (!media) {
      throw new NotFoundException(`media ${mediaId} was not found for object ${objectId}`);
    }

    await db.execute(sql`
      DELETE FROM object_files
      WHERE id = ${mediaId}
    `);

    const remainingReferences = await db.execute<{ reference_count: number }>(sql`
      SELECT COUNT(*)::int AS reference_count
      FROM object_files
      WHERE file_id = ${media.file_id}
    `);

    if (remainingReferences.rows[0]?.reference_count === 0) {
      await db.execute(sql`
        DELETE FROM files
        WHERE id = ${media.file_id}
      `);

      await this.storageService.delete(media.storage_path);
    }

    if (media.is_primary) {
      const nextPrimary = await db.execute<{ file_id: string | null }>(sql`
        SELECT object_files.file_id
        FROM object_files
        INNER JOIN files ON files.id = object_files.file_id
        WHERE object_files.object_id = ${objectId}
          AND files.mime_type LIKE 'image/%'
        ORDER BY object_files.created_at ASC
        LIMIT 1
      `);

      await db.execute(sql`
        UPDATE objects
        SET primary_file_id = ${nextPrimary.rows[0]?.file_id ?? null},
            updated_at = NOW()
        WHERE id = ${objectId}
      `);
    } else {
      await db.execute(sql`
        UPDATE objects
        SET updated_at = NOW()
        WHERE id = ${objectId}
      `);
    }

    return this.getById(objectId);
  }

  async getByPublicId(publicId: string): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    const result = await db.execute<DatabaseObjectRow>(sql`
      ${this.objectSelectSql()}
      FROM objects
      LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
      WHERE objects.public_id = ${publicId}
    `);

    const object = result.rows[0];

    if (!object) {
      throw new NotFoundException(`public object ${publicId} was not found`);
    }

    return mapObjectRow(object);
  }

  async getPublicObject(publicId: string): Promise<PublicObjectRecord> {
    const object = await this.getByPublicId(publicId);
    const media = await this.listMedia(object.id);

    return {
      id: object.id,
      publicId: object.publicId,
      title: object.title,
      description: object.description,
      story: object.story,
      tags: object.tags,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
      media
    };
  }
}
