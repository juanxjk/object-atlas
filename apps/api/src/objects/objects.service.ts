import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { and, asc, desc, eq, ilike, isNull, like, sql, SQL } from 'drizzle-orm';
import type { PublicObjectRecord } from '@object-atlas/types';

import { CollectionsService } from '../collections/collections.service';
import { ensureCollectionsSchema } from '../collections/collections.schema';
import { FILES_LIMITS, OBJECTS_LIMITS } from '../database/schema-limits';
import { DatabaseService } from '../database/database.service';
import { collectionsTable, filesTable, objectFilesTable, objectsTable } from '../database/schema';
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

@Injectable()
export class ObjectsService implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly collectionsService: CollectionsService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService
  ) {}

  async onModuleInit(): Promise<void> {
    const db = this.databaseService.getDb();

    await ensureCollectionsSchema(db);

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
      ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL
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
    const filesWithoutHash = await db.query.filesTable.findMany({
      where: isNull(filesTable.contentHash)
    });

    for (const file of filesWithoutHash) {
      try {
        const fileBuffer = await readFile(this.storageService.resolvePath(file.storagePath));
        const contentHash = this.computeFileHash(fileBuffer);

        await db.update(filesTable).set({ contentHash }).where(eq(filesTable.id, file.id));
      } catch {
        continue;
      }
    }
  }

  private getObjectsBaseQuery() {
    const db = this.databaseService.getDb();
    return db.select({
      object: objectsTable,
      collection: collectionsTable,
      primaryFileStoragePath: filesTable.storagePath,
      thumbnailPath: sql<string | null>`(
        SELECT files.storage_path
        FROM object_files
        INNER JOIN files ON files.id = object_files.file_id
        WHERE object_files.object_id = ${objectsTable.id}
          AND files.mime_type LIKE 'image/%'
        ORDER BY object_files.created_at ASC
        LIMIT 1
      )`
    })
    .from(objectsTable)
    .leftJoin(collectionsTable, eq(objectsTable.collectionId, collectionsTable.id))
    .leftJoin(filesTable, eq(objectsTable.primaryFileId, filesTable.id));
  }

  private mapObjectQueryResult(row: { object: any; collection: any; primaryFileStoragePath: string | null; thumbnailPath: string | null }): ObjectRecord {
    const thumbnailPath = row.primaryFileStoragePath ?? row.thumbnailPath ?? null;
    return mapObjectRow({
      ...row.object,
      thumbnailPath,
      collection: row.collection
    });
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

    if (input.collectionId) {
      await this.collectionsService.ensureCollectionExists(input.collectionId);
    }
    
    await db.insert(objectsTable).values({
      id,
      publicId,
      title: input.title,
      description: input.description,
      story: input.story,
      tags: input.tags ?? [],
      collectionId: input.collectionId,
      metadata: input.metadata ?? {}
    });

    return this.getById(id);
  }

  async list(searchQuery?: string, collectionId?: string): Promise<ObjectRecord[]> {
    const normalizedQuery = searchQuery?.trim();
    const normalizedCollectionId = collectionId?.trim();

    if (normalizedCollectionId) {
      await this.collectionsService.ensureCollectionExists(normalizedCollectionId);
    }

    const conditions: SQL[] = [];
    if (normalizedQuery) {
      conditions.push(ilike(objectsTable.title, `%${normalizedQuery}%`));
    }
    if (normalizedCollectionId) {
      conditions.push(eq(objectsTable.collectionId, normalizedCollectionId));
    }

    const query = this.getObjectsBaseQuery();
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    query.orderBy(desc(objectsTable.updatedAt));

    const rows = await query;
    return rows.map(r => this.mapObjectQueryResult(r));
  }

  async getById(id: string): Promise<ObjectRecord> {
    const rows = await this.getObjectsBaseQuery().where(eq(objectsTable.id, id));
    if (!rows[0]) {
      throw new NotFoundException(`object ${id} was not found`);
    }

    return this.mapObjectQueryResult(rows[0]);
  }

  async update(id: string, input: UpdateObjectInput): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    const current = await this.getById(id);
    const next = {
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      story: input.story ?? current.story,
      tags: input.tags ?? current.tags,
      collectionId: input.collectionId === undefined ? current.collection?.id ?? null : input.collectionId,
      metadata: input.metadata ?? current.metadata
    };

    if (next.collectionId) {
      await this.collectionsService.ensureCollectionExists(next.collectionId);
    }

    await db.update(objectsTable)
      .set({
        title: next.title,
        description: next.description,
        story: next.story,
        tags: next.tags ?? [],
        collectionId: next.collectionId,
        metadata: next.metadata ?? {},
        updatedAt: new Date()
      })
      .where(eq(objectsTable.id, id));

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const db = this.databaseService.getDb();
    await this.getById(id);

    const media = await this.listMedia(id);
    for (const item of media) {
      await this.deleteMedia(id, item.id);
    }

    await db.delete(objectsTable).where(eq(objectsTable.id, id));
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

    const existingFileResult = await db.query.filesTable.findFirst({
      where: eq(filesTable.contentHash, contentHash)
    });

    let fileId = existingFileResult?.id ?? null;
    let storagePath = existingFileResult?.storagePath ?? null;
    let mimeType = existingFileResult?.mimeType ?? file.mimetype;
    let size = existingFileResult?.size ?? file.size;
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

      await db.insert(filesTable).values({
        id: fileId,
        originalFilename: file.originalname,
        storagePath,
        contentHash,
        mimeType,
        size
      });
    }

    await db.insert(objectFilesTable).values({
      id: mediaId,
      objectId,
      fileId
    }).onConflictDoNothing();

    const relation = await db.query.objectFilesTable.findFirst({
      where: and(eq(objectFilesTable.objectId, objectId), eq(objectFilesTable.fileId, fileId))
    });

    if (!relation) {
      throw new Error('Failed to resolve object relation with file');
    }

    const shouldBecomePrimary = !object.primaryFileId && mimeType.startsWith('image/');

    if (shouldBecomePrimary) {
      await db.update(objectsTable)
        .set({ primaryFileId: fileId, updatedAt: new Date() })
        .where(eq(objectsTable.id, objectId));
    }

    return mapObjectMediaRow({
      ...relation,
      originalFilename: existingFileResult?.originalFilename ?? file.originalname,
      storagePath,
      mimeType,
      size,
      isPrimary: shouldBecomePrimary
    });
  }

  async listMedia(objectId: string): Promise<ObjectMediaRecord[]> {
    const db = this.databaseService.getDb();
    await this.getById(objectId);

    const result = await db.select({
      objectFile: objectFilesTable,
      file: filesTable,
      isPrimary: sql<boolean>`(${objectsTable.primaryFileId} = ${objectFilesTable.fileId})`
    })
    .from(objectFilesTable)
    .innerJoin(filesTable, eq(filesTable.id, objectFilesTable.fileId))
    .innerJoin(objectsTable, eq(objectsTable.id, objectFilesTable.objectId))
    .where(eq(objectFilesTable.objectId, objectId))
    .orderBy(desc(objectFilesTable.createdAt));

    return result.map(r => mapObjectMediaRow({
      ...r.objectFile,
      originalFilename: r.file.originalFilename,
      storagePath: r.file.storagePath,
      mimeType: r.file.mimeType,
      size: r.file.size,
      isPrimary: r.isPrimary
    }));
  }

  async setPrimaryMedia(objectId: string, mediaId: string): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    await this.getById(objectId);

    const rows = await db.select({
      fileId: objectFilesTable.fileId,
      mimeType: filesTable.mimeType,
      storagePath: filesTable.storagePath
    })
    .from(objectFilesTable)
    .innerJoin(filesTable, eq(filesTable.id, objectFilesTable.fileId))
    .where(and(eq(objectFilesTable.id, mediaId), eq(objectFilesTable.objectId, objectId)))
    .limit(1);

    const media = rows[0];

    if (!media) {
      throw new NotFoundException(`media ${mediaId} was not found for object ${objectId}`);
    }

    if (!media.mimeType.startsWith('image/')) {
      throw new NotFoundException(`media ${mediaId} is not an image`);
    }

    await db.update(objectsTable)
      .set({ primaryFileId: media.fileId, updatedAt: new Date() })
      .where(eq(objectsTable.id, objectId));

    return this.getById(objectId);
  }

  async deleteMedia(objectId: string, mediaId: string): Promise<ObjectRecord> {
    const db = this.databaseService.getDb();
    await this.getById(objectId);

    const mediaResult = await db.select({
      fileId: objectFilesTable.fileId,
      storagePath: filesTable.storagePath,
      isPrimary: sql<boolean>`(${objectsTable.primaryFileId} = ${objectFilesTable.fileId})`
    })
    .from(objectFilesTable)
    .innerJoin(filesTable, eq(filesTable.id, objectFilesTable.fileId))
    .innerJoin(objectsTable, eq(objectsTable.id, objectFilesTable.objectId))
    .where(and(eq(objectFilesTable.id, mediaId), eq(objectFilesTable.objectId, objectId)))
    .limit(1);

    const media = mediaResult[0];

    if (!media) {
      throw new NotFoundException(`media ${mediaId} was not found for object ${objectId}`);
    }

    await db.delete(objectFilesTable).where(eq(objectFilesTable.id, mediaId));

    const remainingReferences = await db.select({
      referenceCount: sql<number>`cast(count(*) as int)`
    })
    .from(objectFilesTable)
    .where(eq(objectFilesTable.fileId, media.fileId));

    if (remainingReferences[0]?.referenceCount === 0) {
      await db.delete(filesTable).where(eq(filesTable.id, media.fileId));
      await this.storageService.delete(media.storagePath);
    }

    if (media.isPrimary) {
      const nextPrimary = await db.select({ fileId: objectFilesTable.fileId })
        .from(objectFilesTable)
        .innerJoin(filesTable, eq(filesTable.id, objectFilesTable.fileId))
        .where(and(eq(objectFilesTable.objectId, objectId), like(filesTable.mimeType, 'image/%')))
        .orderBy(asc(objectFilesTable.createdAt))
        .limit(1);

      await db.update(objectsTable)
        .set({ primaryFileId: nextPrimary[0]?.fileId ?? null, updatedAt: new Date() })
        .where(eq(objectsTable.id, objectId));
    } else {
      await db.update(objectsTable)
        .set({ updatedAt: new Date() })
        .where(eq(objectsTable.id, objectId));
    }

    return this.getById(objectId);
  }

  async getByPublicId(publicId: string): Promise<ObjectRecord> {
    const rows = await this.getObjectsBaseQuery().where(eq(objectsTable.publicId, publicId)).limit(1);

    if (!rows[0]) {
      throw new NotFoundException(`public object ${publicId} was not found`);
    }

    return this.mapObjectQueryResult(rows[0]);
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
