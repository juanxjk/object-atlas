import { randomUUID } from 'node:crypto';

import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PublicObjectRecord } from '@object-atlas/types';

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

@Injectable()
export class ObjectsService implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.databaseService.getPool().query(`
      CREATE TABLE IF NOT EXISTS objects (
        id UUID PRIMARY KEY,
        public_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        story TEXT,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.databaseService.getPool().query(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY,
        original_filename TEXT NOT NULL,
        storage_path TEXT NOT NULL UNIQUE,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.databaseService.getPool().query(`
      CREATE TABLE IF NOT EXISTS object_media (
        id UUID PRIMARY KEY,
        object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
        original_filename TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.databaseService.getPool().query(`
      CREATE TABLE IF NOT EXISTS object_files (
        id UUID PRIMARY KEY,
        object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (object_id, file_id)
      )
    `);

    await this.databaseService.getPool().query(`
      ALTER TABLE objects
      ADD COLUMN IF NOT EXISTS primary_file_id UUID REFERENCES files(id) ON DELETE SET NULL
    `);

    await this.databaseService.getPool().query(`
      INSERT INTO files (id, original_filename, storage_path, mime_type, size, created_at)
      SELECT id, original_filename, storage_path, mime_type, size, created_at
      FROM object_media
      ON CONFLICT (id) DO NOTHING
    `);

    await this.databaseService.getPool().query(`
      INSERT INTO object_files (id, object_id, file_id, created_at)
      SELECT id, object_id, id, created_at
      FROM object_media
      ON CONFLICT (id) DO NOTHING
    `);

    await this.databaseService.getPool().query(`
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
  }

  private getObjectSelectClause(): string {
    return `
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
    const id = randomUUID();
    const publicId = randomUUID();
    const { rows } = await this.databaseService.getPool().query(
      `
        INSERT INTO objects (
          id,
          public_id,
          title,
          description,
          story,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING *
      `,
      [id, publicId, input.title, input.description, input.story, JSON.stringify(input.metadata)]
    );

    return mapObjectRow(rows[0]);
  }

  async list(searchQuery?: string): Promise<ObjectRecord[]> {
    const normalizedQuery = searchQuery?.trim();
    const hasQuery = Boolean(normalizedQuery);
    const { rows } = await this.databaseService.getPool().query(
      `
        ${this.getObjectSelectClause()}
        FROM objects
        LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
        WHERE ($1::text IS NULL OR title ILIKE '%' || $1 || '%')
        ORDER BY updated_at DESC
      `,
      [hasQuery ? normalizedQuery : null]
    );

    return rows.map(mapObjectRow);
  }

  async getById(id: string): Promise<ObjectRecord> {
    const { rows } = await this.databaseService.getPool().query(
      `
        ${this.getObjectSelectClause()}
        FROM objects
        LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
        WHERE id = $1
      `,
      [id]
    );

    const object = rows[0];

    if (!object) {
      throw new NotFoundException(`object ${id} was not found`);
    }

    return mapObjectRow(object);
  }

  async update(id: string, input: UpdateObjectInput): Promise<ObjectRecord> {
    const current = await this.getById(id);
    const next = {
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      story: input.story ?? current.story,
      metadata: input.metadata ?? current.metadata
    };

    const { rows } = await this.databaseService.getPool().query(
      `
        UPDATE objects
        SET
          title = $2,
          description = $3,
          story = $4,
          metadata = $5::jsonb,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id, next.title, next.description, next.story, JSON.stringify(next.metadata)]
    );

    return mapObjectRow({
      ...rows[0],
      thumbnail_path: current.thumbnailPath
    });
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
    const object = await this.getById(objectId);

    const storedFile = await this.storageService.store({
      objectId,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer
    });

    const fileId = randomUUID();
    const mediaId = randomUUID();

    await this.databaseService.getPool().query(
      `
        INSERT INTO files (
          id,
          original_filename,
          storage_path,
          mime_type,
          size
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [fileId, file.originalname, storedFile.relativePath, file.mimetype, file.size]
    );

    const { rows } = await this.databaseService.getPool().query(
      `
        INSERT INTO object_files (
          id,
          object_id,
          file_id
        )
        VALUES ($1, $2, $3)
        RETURNING id, object_id, file_id, created_at
      `,
      [mediaId, objectId, fileId]
    );

    const shouldBecomePrimary = !object.primaryFileId && file.mimetype.startsWith('image/');

    if (shouldBecomePrimary) {
      await this.databaseService.getPool().query(
        `
          UPDATE objects
          SET primary_file_id = $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [objectId, fileId]
      );
    }

    return mapObjectMediaRow({
      ...rows[0],
      original_filename: file.originalname,
      storage_path: storedFile.relativePath,
      mime_type: file.mimetype,
      size: file.size,
      is_primary: shouldBecomePrimary
    });
  }

  async listMedia(objectId: string): Promise<ObjectMediaRecord[]> {
    await this.getById(objectId);

    const { rows } = await this.databaseService.getPool().query(
      `
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
        WHERE object_files.object_id = $1
        ORDER BY object_files.created_at DESC
      `,
      [objectId]
    );

    return rows.map(mapObjectMediaRow);
  }

  async setPrimaryMedia(objectId: string, mediaId: string): Promise<ObjectRecord> {
    await this.getById(objectId);

    const { rows } = await this.databaseService.getPool().query(
      `
        SELECT object_files.file_id, files.mime_type, files.storage_path
        FROM object_files
        INNER JOIN files ON files.id = object_files.file_id
        WHERE object_files.id = $1
          AND object_files.object_id = $2
      `,
      [mediaId, objectId]
    );

    const media = rows[0];

    if (!media) {
      throw new NotFoundException(`media ${mediaId} was not found for object ${objectId}`);
    }

    if (!String(media.mime_type).startsWith('image/')) {
      throw new NotFoundException(`media ${mediaId} is not an image`);
    }

    const { rows: updatedRows } = await this.databaseService.getPool().query(
      `
        UPDATE objects
        SET primary_file_id = $2,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [objectId, media.file_id]
    );

    return mapObjectRow({
      ...updatedRows[0],
      thumbnail_path: media.storage_path
    });
  }

  async getByPublicId(publicId: string): Promise<ObjectRecord> {
    const { rows } = await this.databaseService.getPool().query(
      `
        ${this.getObjectSelectClause()}
        FROM objects
        LEFT JOIN files AS primary_file ON primary_file.id = objects.primary_file_id
        WHERE public_id = $1
      `,
      [publicId]
    );

    const object = rows[0];

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
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
      media
    };
  }
}
