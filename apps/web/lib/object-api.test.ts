import { afterEach, describe, expect, it, vi } from 'vitest';

import { getObjects, getPublicObject } from './object-api';

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

    await getObjects('lamp');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/objects?q=lamp',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('returns null when the public object endpoint is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(getPublicObject('missing')).resolves.toBeNull();
  });
});
