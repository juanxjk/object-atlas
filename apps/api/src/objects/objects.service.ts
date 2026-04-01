import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { mapObjectRow } from './object.mapper';
import { CreateObjectInput, ObjectRecord, UpdateObjectInput } from './object.types';

@Injectable()
export class ObjectsService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

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

  async list(): Promise<ObjectRecord[]> {
    const { rows } = await this.databaseService.getPool().query(
      `
        SELECT *
        FROM objects
        ORDER BY updated_at DESC
      `
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
}
