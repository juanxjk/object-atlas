export type ObjectRecord = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  story: string | null;
  thumbnailPath: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ObjectMediaRecord = {
  id: string;
  objectId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type PublicObjectRecord = Pick<
  ObjectRecord,
  'id' | 'publicId' | 'title' | 'description' | 'story' | 'createdAt' | 'updatedAt'
> & {
  media: ObjectMediaRecord[];
};
