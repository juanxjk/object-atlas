import { relations, sql } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import { FILES_LIMITS, OBJECTS_LIMITS } from './schema-limits';

export const filesTable = pgTable('files', {
  id: uuid('id').primaryKey(),
  originalFilename: varchar('original_filename', { length: FILES_LIMITS.originalFilename }).notNull(),
  storagePath: varchar('storage_path', { length: FILES_LIMITS.storagePath }).notNull().unique(),
  contentHash: varchar('content_hash', { length: FILES_LIMITS.contentHash }),
  mimeType: varchar('mime_type', { length: FILES_LIMITS.mimeType }).notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const objectsTable = pgTable('objects', {
  id: uuid('id').primaryKey(),
  publicId: varchar('public_id', { length: OBJECTS_LIMITS.publicId }).notNull().unique(),
  title: varchar('title', { length: OBJECTS_LIMITS.title }).notNull(),
  description: varchar('description', { length: OBJECTS_LIMITS.description }),
  story: varchar('story', { length: OBJECTS_LIMITS.story }),
  tags: varchar('tags', { length: OBJECTS_LIMITS.tag }).array().notNull().default(sql`ARRAY[]::varchar[]`),
  primaryFileId: uuid('primary_file_id').references(() => filesTable.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const objectFilesTable = pgTable(
  'object_files',
  {
    id: uuid('id').primaryKey(),
    objectId: uuid('object_id')
      .notNull()
      .references(() => objectsTable.id, { onDelete: 'cascade' }),
    fileId: uuid('file_id')
      .notNull()
      .references(() => filesTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    objectFileUnique: unique().on(table.objectId, table.fileId)
  })
);

export const objectMediaLegacyTable = pgTable('object_media', {
  id: uuid('id').primaryKey(),
  objectId: uuid('object_id')
    .notNull()
    .references(() => objectsTable.id, { onDelete: 'cascade' }),
  originalFilename: varchar('original_filename', { length: FILES_LIMITS.originalFilename }).notNull(),
  storagePath: varchar('storage_path', { length: FILES_LIMITS.storagePath }).notNull(),
  mimeType: varchar('mime_type', { length: FILES_LIMITS.mimeType }).notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const objectsRelations = relations(objectsTable, ({ one, many }) => ({
  primaryFile: one(filesTable, {
    fields: [objectsTable.primaryFileId],
    references: [filesTable.id]
  }),
  objectFiles: many(objectFilesTable)
}));

export const filesRelations = relations(filesTable, ({ many }) => ({
  objectFiles: many(objectFilesTable)
}));

export const objectFilesRelations = relations(objectFilesTable, ({ one }) => ({
  object: one(objectsTable, {
    fields: [objectFilesTable.objectId],
    references: [objectsTable.id]
  }),
  file: one(filesTable, {
    fields: [objectFilesTable.fileId],
    references: [filesTable.id]
  })
}));

export const schema = {
  filesTable,
  objectsTable,
  objectFilesTable,
  objectMediaLegacyTable
};

export type DatabaseSchema = typeof schema;
