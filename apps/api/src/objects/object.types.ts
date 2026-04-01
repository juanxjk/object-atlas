export type ObjectRecord = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  story: string | null;
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

export type CreateObjectInput = {
  title: string;
  description: string | null;
  story: string | null;
  metadata: Record<string, unknown>;
};

export type UpdateObjectInput = Partial<CreateObjectInput>;
