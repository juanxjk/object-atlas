import type {
  ObjectRecord,
  PublicObjectRecord
} from '@object-atlas/types';

import { readJsonResponse } from './http-response';

const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3001';

export async function getObjects(searchQuery?: string, collectionId?: string): Promise<ObjectRecord[]> {
  const url = new URL(`${apiBaseUrl}/api/objects`);

  if (searchQuery?.trim()) {
    url.searchParams.set('q', searchQuery.trim());
  }

  if (collectionId?.trim()) {
    url.searchParams.set('collectionId', collectionId.trim());
  }

  let response: Response;

  try {
    response = await fetch(url, {
      cache: 'no-store'
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  try {
    return await readJsonResponse<ObjectRecord[]>(response);
  } catch {
    return [];
  }
}

export async function getPublicObject(publicId: string): Promise<PublicObjectRecord | null> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/public/objects/${publicId}`, {
      cache: 'no-store'
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  try {
    return await readJsonResponse<PublicObjectRecord>(response);
  } catch {
    return null;
  }
}
