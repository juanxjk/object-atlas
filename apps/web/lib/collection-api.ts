import type {
  CollectionRecord,
  CollectionWithObjectsRecord,
  PublicCollectionRecord
} from '@object-atlas/types';

import { readJsonResponse } from './http-response';

const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3001';

export async function getCollections(): Promise<CollectionRecord[]> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/collections`, {
      cache: 'no-store'
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  try {
    return await readJsonResponse<CollectionRecord[]>(response);
  } catch {
    return [];
  }
}

export async function getCollection(id: string): Promise<CollectionWithObjectsRecord | null> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/collections/${id}`, {
      cache: 'no-store'
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  try {
    return await readJsonResponse<CollectionWithObjectsRecord>(response);
  } catch {
    return null;
  }
}

export async function getPublicCollection(publicId: string): Promise<PublicCollectionRecord | null> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/public/collections/${publicId}`, {
      cache: 'no-store'
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  try {
    return await readJsonResponse<PublicCollectionRecord>(response);
  } catch {
    return null;
  }
}
