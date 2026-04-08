import type { ObjectRecord, PublicObjectRecord } from '@object-atlas/types';

import { readJsonResponse } from './http-response';

const apiBaseUrl = process.env.API_URL ?? 'http://localhost:3001';

export async function getObjects(searchQuery?: string): Promise<ObjectRecord[]> {
  const url = new URL(`${apiBaseUrl}/api/objects`);

  if (searchQuery?.trim()) {
    url.searchParams.set('q', searchQuery.trim());
  }

  const response = await fetch(url, {
    cache: 'no-store'
  });

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
  const response = await fetch(`${apiBaseUrl}/api/public/objects/${publicId}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  try {
    return await readJsonResponse<PublicObjectRecord>(response);
  } catch {
    return null;
  }
}
