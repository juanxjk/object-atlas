import { relations, sql } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

export const filesTable = pgTable('files', {
  id: uuid('id').primaryKey(),
  originalFilename: text('original_filename').notNull(),
  storagePath: text('storage_path').notNull().unique(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const objectsTable = pgTable('objects', {
  id: uuid('id').primaryKey(),
  publicId: text('public_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  story: text('story'),
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
  originalFilename: text('original_filename').notNull(),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type').notNull(),
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
