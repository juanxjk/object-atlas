export const FILES_LIMITS = {
  originalFilename: 255,
  storagePath: 1024,
  contentHash: 64,
  mimeType: 255
} as const;

export const OBJECTS_LIMITS = {
  publicId: 64,
  title: 160,
  description: 500,
  story: 10000,
  tag: 40,
  tagsPerObject: 12
} as const;

export const COLLECTIONS_LIMITS = {
  publicId: 64,
  title: 160,
  description: 500
} as const;
