'use client';

import { ExternalLink, PackageOpen, Pencil, Plus, QrCode } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import type { CollectionRecord, ObjectRecord } from '@object-atlas/types';

import { ObjectQrCard } from './object-qr-card';
import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { WorkspaceNavbar } from './workspace-navbar';
import { readErrorMessage, readJsonResponse } from '../lib/http-response';

type CollectionFormState = {
  title: string;
  description: string;
  visibility: 'private' | 'unlisted' | 'public';
};

const emptyCollectionFormState: CollectionFormState = {
  title: '',
  description: '',
  visibility: 'private'
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return await readJsonResponse<T>(response);
}

function getPublicCollectionUrl(publicId: string): string {
  return `${publicAppUrl}/collections/public/${publicId}`;
}

function visibilityLabel(visibility: CollectionRecord['visibility']): string {
  if (visibility === 'private') return 'Private';
  if (visibility === 'unlisted') return 'Unlisted';
  return 'Public';
}

export function CollectionWorkspacePage({
  initialCollections,
  initialObjects
}: {
  initialCollections: CollectionRecord[];
  initialObjects: ObjectRecord[];
}) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';
  const [collections, setCollections] = useState(initialCollections);
  const [createFormState, setCreateFormState] = useState<CollectionFormState>(
    emptyCollectionFormState
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [qrCollection, setQrCollection] = useState<CollectionRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const collectionCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const object of initialObjects) {
      if (!object.collection?.id) {
        continue;
      }

      counts.set(object.collection.id, (counts.get(object.collection.id) ?? 0) + 1);
    }

    return counts;
  }, [initialObjects]);

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <WorkspaceNavbar />

        <section
          className="rounded-[2rem] border p-4 sm:p-5"
          style={{
            backgroundColor: isDark ? activeTheme.surface.dark : activeTheme.surface.light,
            borderColor: activeTheme.cardBorder
          }}
        >
          <div
            className="rounded-[1.5rem] px-4 py-5 sm:px-5"
            style={{ backgroundColor: activeTheme.listingPanel, color: '#17181d' }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: activeTheme.badgeText }}
                >
                  Collections
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                  Group objects into internal and public sets.
                </h1>
                <p className="mt-2 text-sm leading-6" style={{ color: activeTheme.cardMetaText }}>
                  Create collections here, then press edit to open the full collection management view.
                </p>
              </div>

              <Button type="button" onClick={() => setIsCreateOpen(true)} variant="primary" size="lg">
                <Plus size={16} strokeWidth={2.1} />
                New collection
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {collections.length === 0 ? (
                <div
                  className="rounded-3xl border px-5 py-5 text-sm"
                  style={{
                    backgroundColor: activeTheme.cardPrimary,
                    borderColor: activeTheme.cardBorder,
                    color: activeTheme.cardMetaText
                  }}
                >
                  No collections yet. Start with a title and visibility, then manage items from the full collection view.
                </div>
              ) : (
                collections.map((collection) => {
                  const canShare = collection.visibility !== 'private';
                  const collectionObjectCount = collectionCounts.get(collection.id) ?? 0;

                  return (
                    <article
                      key={collection.id}
                      className="rounded-3xl border p-5"
                      style={{
                        backgroundColor: activeTheme.cardPrimary,
                        borderColor: activeTheme.cardBorder
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{ color: activeTheme.accent }}
                          >
                            <PackageOpen size={14} strokeWidth={2.1} />
                            {visibilityLabel(collection.visibility)}
                          </p>
                          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                            {collection.title}
                          </h2>
                        </div>

                        <Button href={`/collections/${collection.id}`} variant="secondary">
                          <Pencil size={16} strokeWidth={2.1} />
                          Edit
                        </Button>
                      </div>

                      <p className="mt-3 text-sm leading-6" style={{ color: activeTheme.cardMetaText }}>
                        {collection.description ?? 'No collection description yet.'}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.16em]"
                          style={{ color: activeTheme.badgeText }}
                        >
                          {collectionObjectCount} item{collectionObjectCount === 1 ? '' : 's'}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button href={`/collections/${collection.id}`} variant="secondary">
                          <PackageOpen size={16} strokeWidth={2.1} />
                          Open full view
                        </Button>

                        {canShare ? (
                          <>
                            <Button
                              href={getPublicCollectionUrl(collection.publicId)}
                              target="_blank"
                              rel="noreferrer"
                              variant="secondary"
                            >
                              <ExternalLink size={16} strokeWidth={2.1} />
                              Open public page
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setQrCollection(collection)}
                              variant="secondary"
                            >
                              <QrCode size={16} strokeWidth={2.1} />
                              Show QR
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      <Dialog.Root
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setCreateError(null);
            setCreateFormState(emptyCollectionFormState);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 bg-ink/35" />
          <Dialog.Popup
            className="fixed left-1/2 top-1/2 z-30 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-soft border p-5 shadow-xl sm:p-6"
            style={{
              backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.badgeBg,
              borderColor: activeTheme.cardBorder
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.accent }}>
              Create collection
            </p>
            <Dialog.Title
              className="mt-1 font-[family-name:var(--font-display)] text-3xl"
              style={{ color: isDark ? '#f7f3ee' : '#17181d' }}
            >
              New grouped set
            </Dialog.Title>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsCreating(true);
                setCreateError(null);

                try {
                  const created = await requestJson<CollectionRecord>('/api/collections', {
                    method: 'POST',
                    body: JSON.stringify(createFormState)
                  });

                  setCollections((current) => [created, ...current]);
                  setIsCreateOpen(false);
                  setCreateFormState(emptyCollectionFormState);
                } catch (error) {
                  setCreateError(
                    error instanceof Error ? error.message : 'Unable to create collection'
                  );
                } finally {
                  setIsCreating(false);
                }
              }}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Title</span>
                <Input
                  value={createFormState.title}
                  onChange={(event) =>
                    setCreateFormState((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Description</span>
                <Textarea
                  value={createFormState.description}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  rows={4}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Visibility</span>
                <select
                  value={createFormState.visibility}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      visibility: event.target.value as CollectionFormState['visibility']
                    }))
                  }
                  className="w-full rounded-2xl border px-3 py-3 text-sm"
                  style={{
                    backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted,
                    borderColor: activeTheme.cardBorder,
                    color: isDark ? '#f7f3ee' : '#17181d'
                  }}
                >
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </label>

              {createError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isCreating} variant="primary" size="lg">
                  <Plus size={16} strokeWidth={2.1} />
                  {isCreating ? 'Creating...' : 'Create collection'}
                </Button>
                <Dialog.Close
                  className="inline-flex items-center rounded-full border px-5 py-3 text-sm font-semibold"
                  style={{ borderColor: activeTheme.cardBorder }}
                >
                  Cancel
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(qrCollection)} onOpenChange={(open) => !open && setQrCollection(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 bg-ink/35" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-30 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-soft">
            {qrCollection ? (
              <ObjectQrCard
                title={qrCollection.title}
                publicUrl={getPublicCollectionUrl(qrCollection.publicId)}
                entityLabel="collection"
                actionSlot={
                  <Dialog.Close
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: activeTheme.cardBorder, color: isDark ? '#f7f3ee' : '#17181d' }}
                  >
                    Close
                  </Dialog.Close>
                }
              />
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
