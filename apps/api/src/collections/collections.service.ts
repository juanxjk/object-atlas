import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit
} from '@nestjs/common';
import { and, asc, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service';
import { collectionsTable, filesTable, objectsTable } from '../database/schema';
import { mapObjectRow } from '../objects/object.mapper';
import { mapCollectionRow } from './collection.mapper';
import {
  CollectionRecord,
  CollectionWithObjectsRecord,
  CreateCollectionInput,
  PublicCollectionRecord,
  UpdateCollectionInput
} from './collection.types';
import { ensureCollectionsSchema } from './collections.schema';

@Injectable()
export class CollectionsService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    await ensureCollectionsSchema(this.databaseService.getDb());
  }

  private async getObjectsForCollection(collectionId: string) {
    const db = this.databaseService.getDb();
    const rows = await db.select({
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
    .leftJoin(filesTable, eq(objectsTable.primaryFileId, filesTable.id))
    .where(eq(objectsTable.collectionId, collectionId))
    .orderBy(desc(objectsTable.updatedAt));

    return rows.map((row) => {
      const thumbnailPath = row.primaryFileStoragePath ?? row.thumbnailPath ?? null;
      return mapObjectRow({
        ...row.object,
        thumbnailPath,
        collection: row.collection
      });
    });
  }

  async ensureCollectionExists(id: string): Promise<void> {
    const db = this.databaseService.getDb();
    const collection = await db.query.collectionsTable.findFirst({
      columns: { id: true },
      where: eq(collectionsTable.id, id)
    });

    if (!collection) {
      throw new BadRequestException(`collection ${id} was not found`);
    }
  }

  async create(input: CreateCollectionInput): Promise<CollectionRecord> {
    const db = this.databaseService.getDb();
    const id = randomUUID();
    const publicId = randomUUID();
    
    const result = await db.insert(collectionsTable)
      .values({
        id,
        publicId,
        title: input.title,
        description: input.description,
        visibility: input.visibility ?? 'private'
      })
      .returning();

    return mapCollectionRow(result[0]);
  }

  async list(searchQuery?: string, visibility?: string): Promise<CollectionRecord[]> {
    const db = this.databaseService.getDb();
    const normalizedQuery = searchQuery?.trim();
    const normalizedVisibility = visibility?.trim();
    
    const conditions: SQL[] = [];
    if (normalizedQuery) {
      conditions.push(ilike(collectionsTable.title, `%${normalizedQuery}%`));
    }
    if (normalizedVisibility === 'private' || normalizedVisibility === 'unlisted' || normalizedVisibility === 'public') {
      conditions.push(eq(collectionsTable.visibility, normalizedVisibility));
    }

    const collections = await db.query.collectionsTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(collectionsTable.updatedAt), asc(collectionsTable.title)]
    });

    return collections.map(mapCollectionRow);
  }

  async getById(id: string): Promise<CollectionWithObjectsRecord> {
    const db = this.databaseService.getDb();
    const collection = await db.query.collectionsTable.findFirst({
      where: eq(collectionsTable.id, id)
    });

    if (!collection) {
      throw new NotFoundException(`collection ${id} was not found`);
    }

    const objects = await this.getObjectsForCollection(id);

    return {
      ...mapCollectionRow(collection),
      objectCount: objects.length,
      objects
    };
  }

  async update(id: string, input: UpdateCollectionInput): Promise<CollectionRecord> {
    await this.getById(id);
    const db = this.databaseService.getDb();
    
    const result = await db.update(collectionsTable)
      .set({
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        updatedAt: new Date()
      })
      .where(eq(collectionsTable.id, id))
      .returning();

    return mapCollectionRow(result[0]);
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getById(id);

    if (collection.objectCount > 0) {
      throw new BadRequestException('collection cannot be deleted while objects still reference it');
    }

    const db = this.databaseService.getDb();
    await db.delete(collectionsTable).where(eq(collectionsTable.id, id));
  }

  async getPublicCollection(publicId: string): Promise<PublicCollectionRecord> {
    const db = this.databaseService.getDb();
    const collection = await db.query.collectionsTable.findFirst({
      where: and(
        eq(collectionsTable.publicId, publicId),
        inArray(collectionsTable.visibility, ['unlisted', 'public'])
      )
    });

    if (!collection) {
      throw new NotFoundException(`public collection ${publicId} was not found`);
    }

    const objects = await this.getObjectsForCollection(collection.id);

    return {
      ...mapCollectionRow(collection),
      objects: objects.map(obj => ({
        id: obj.id,
        publicId: obj.publicId,
        title: obj.title,
        description: obj.description,
        thumbnailPath: obj.thumbnailPath,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
      }))
    };
  }
}
