import { randomUUID } from 'node:crypto';

import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { STORAGE_SERVICE } from '../storage/storage.constants';
import { StorageService } from '../storage/storage.types';
import { mapObjectMediaRow } from './object-media.mapper';
import { mapObjectRow } from './object.mapper';
import { PublicObjectRecord } from './public-object.types';
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
        SELECT *
        FROM objects
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
        SELECT *
        FROM objects
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

    return mapObjectRow(rows[0]);
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
    await this.getById(objectId);

    const storedFile = await this.storageService.store({
      objectId,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer
    });

    const mediaId = randomUUID();
    const { rows } = await this.databaseService.getPool().query(
      `
        INSERT INTO object_media (
          id,
          object_id,
          original_filename,
          storage_path,
          mime_type,
          size
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        mediaId,
        objectId,
        file.originalname,
        storedFile.relativePath,
        file.mimetype,
        file.size
      ]
    );

    return mapObjectMediaRow(rows[0]);
  }

  async listMedia(objectId: string): Promise<ObjectMediaRecord[]> {
    await this.getById(objectId);

    const { rows } = await this.databaseService.getPool().query(
      `
        SELECT *
        FROM object_media
        WHERE object_id = $1
        ORDER BY created_at DESC
      `,
      [objectId]
    );

    return rows.map(mapObjectMediaRow);
  }

  async getByPublicId(publicId: string): Promise<ObjectRecord> {
    const { rows } = await this.databaseService.getPool().query(
      `
        SELECT *
        FROM objects
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
