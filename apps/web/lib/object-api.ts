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

export type PublicObjectRecord = Pick<
  ObjectRecord,
  'id' | 'publicId' | 'title' | 'description' | 'story' | 'createdAt' | 'updatedAt'
> & {
  media: ObjectMediaRecord[];
};

const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3001';

export async function getObjects(): Promise<ObjectRecord[]> {
  const response = await fetch(`${apiBaseUrl}/api/objects`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as ObjectRecord[];
}

export async function getPublicObject(publicId: string): Promise<PublicObjectRecord | null> {
  const response = await fetch(`${apiBaseUrl}/api/public/objects/${publicId}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as PublicObjectRecord;
}
