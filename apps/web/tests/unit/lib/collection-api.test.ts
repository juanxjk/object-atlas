import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getCollection,
  getCollections,
  getPublicCollection
} from '../../../lib/collection-api';

describe('collection api helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty array when the collections endpoint is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(getCollections()).resolves.toEqual([]);
  });

  it('returns null when collection endpoints are unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(getCollection('missing')).resolves.toBeNull();
    await expect(getPublicCollection('missing')).resolves.toBeNull();
  });
});
