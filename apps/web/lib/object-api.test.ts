import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCollection, getObjects, getPublicCollection, getPublicObject } from './object-api';

describe('object api helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds the title search query when listing objects', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    });

    vi.stubGlobal('fetch', fetchMock);

    await getObjects('lamp', 'collection-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]?.toString()).toBe(
      'http://localhost:3001/api/objects?q=lamp&collectionId=collection-1'
    );
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ cache: 'no-store' });
  });

  it('returns null when the public object endpoint is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(getPublicObject('missing')).resolves.toBeNull();
  });

  it('returns null when the collection endpoint is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(getCollection('missing')).resolves.toBeNull();
    await expect(getPublicCollection('missing')).resolves.toBeNull();
  });
});
