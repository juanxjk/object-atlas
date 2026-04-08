'use client';

import { ExternalLink, PackageOpen, Pencil, Plus, QrCode, X } from 'lucide-react';
import { Dialog } from '@base-ui/react/dialog';
import { useMemo, useState } from 'react';
import type { CollectionRecord, CollectionWithObjectsRecord, ObjectRecord } from '@object-atlas/types';

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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const itemsPerPage = 6;

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

function getThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath) {
    return null;
  }

  return `${apiBaseUrl}/uploads/${thumbnailPath}`;
}

function getPublicCollectionUrl(publicId: string): string {
  return `${publicAppUrl}/collections/public/${publicId}`;
}

function visibilityLabel(visibility: CollectionRecord['visibility']): string {
  if (visibility === 'private') return 'Private';
  if (visibility === 'unlisted') return 'Unlisted';
  return 'Public';
}

function toFormState(collection: CollectionRecord): CollectionFormState {
  return {
    title: collection.title,
    description: collection.description ?? '',
    visibility: collection.visibility
  };
}

function ItemCard({
  activeTheme,
  isBusy,
  isDark,
  label,
  object,
  onClick
}: {
  activeTheme: (typeof themeStyles)[keyof typeof themeStyles];
  isBusy: boolean;
  isDark: boolean;
  label: string;
  object: ObjectRecord;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isBusy}
      className="min-h-[220px] rounded-3xl border p-5 text-left transition"
      style={{
        backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.badgeBg,
        borderColor: activeTheme.cardBorder,
        color: isDark ? '#f7f3ee' : '#17181d',
        opacity: isBusy ? 0.65 : 1
      }}
    >
      <div className="flex h-full flex-col">
        {object.thumbnailPath ? (
          <img
            src={getThumbnailUrl(object.thumbnailPath) ?? ''}
            alt={object.title}
            className="h-32 w-full rounded-2xl object-cover"
          />
        ) : (
          <div
            className="flex h-32 items-center justify-center rounded-2xl border border-dashed text-sm"
            style={{
              borderColor: activeTheme.cardBorder,
              color: isDark ? 'rgba(255,255,255,0.58)' : activeTheme.cardMetaText
            }}
          >
            No image
          </div>
        )}

        <div className="mt-4 flex-1">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">{object.title}</h3>
          <p
            className="mt-2 text-sm leading-6"
            style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}
          >
            {object.description ?? 'No description yet.'}
          </p>
        </div>

        <p
          className="mt-4 text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: activeTheme.badgeText }}
        >
          {isBusy ? 'Saving...' : label}
        </p>
      </div>
    </button>
  );
}

export function CollectionDetailPage({
  collection,
  initialObjects
}: {
  collection: CollectionWithObjectsRecord;
  initialObjects: ObjectRecord[];
}) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';
  const [currentCollection, setCurrentCollection] = useState(collection);
  const [objects, setObjects] = useState(initialObjects);
  const [formState, setFormState] = useState<CollectionFormState>(toFormState(collection));
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingObjectId, setSavingObjectId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [itemsPage, setItemsPage] = useState(1);
  const [pickerPage, setPickerPage] = useState(1);

  const canShare = currentCollection.visibility !== 'private';
  const collectionObjects = useMemo(
    () => objects.filter((object) => object.collection?.id === currentCollection.id),
    [currentCollection.id, objects]
  );
  const availableObjects = useMemo(
    () => objects.filter((object) => object.collection?.id !== currentCollection.id),
    [currentCollection.id, objects]
  );
  const itemsPageCount = Math.max(1, Math.ceil(collectionObjects.length / itemsPerPage));
  const pickerPageCount = Math.max(1, Math.ceil(availableObjects.length / itemsPerPage));
  const pagedItems = collectionObjects.slice((itemsPage - 1) * itemsPerPage, itemsPage * itemsPerPage);
  const pagedPickerItems = availableObjects.slice(
    (pickerPage - 1) * itemsPerPage,
    pickerPage * itemsPerPage
  );

  async function updateObjectMembership(object: ObjectRecord, nextCollectionId: string | null) {
    setSavingObjectId(object.id);
    setPickerError(null);

    try {
      const updated = await requestJson<ObjectRecord>(`/api/objects/${object.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          collectionId: nextCollectionId
        })
      });

      setObjects((current) =>
        current.map((candidate) => (candidate.id === updated.id ? updated : candidate))
      );

      if (nextCollectionId === currentCollection.id) {
        setIsPickerOpen(false);
      }
    } catch (error) {
      setPickerError(error instanceof Error ? error.message : 'Unable to update collection items');
    } finally {
      setSavingObjectId(null);
    }
  }

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <WorkspaceNavbar />

        <section
          className="rounded-soft border p-6 sm:p-8"
          style={{
            backgroundColor: isDark ? activeTheme.heroPanel : activeTheme.badgeBg,
            borderColor: activeTheme.cardBorder
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.accent }}>
                Edit collection
              </p>
              <div
                className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ backgroundColor: activeTheme.badgeBg, color: activeTheme.badgeText }}
              >
                <PackageOpen size={14} strokeWidth={2.1} />
                {visibilityLabel(currentCollection.visibility)}
              </div>
              <h1
                className="mt-4 font-[family-name:var(--font-display)] text-4xl"
                style={{ color: isDark ? '#f7f3ee' : '#17181d' }}
              >
                {currentCollection.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {canShare ? (
                <>
                  <Button
                    href={getPublicCollectionUrl(currentCollection.publicId)}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    size="lg"
                  >
                    <ExternalLink size={16} strokeWidth={2.1} />
                    Open public page
                  </Button>
                  <Button type="button" onClick={() => setIsQrOpen(true)} variant="secondary" size="lg">
                    <QrCode size={16} strokeWidth={2.1} />
                    Show QR code
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="rounded-soft border p-6 sm:p-8"
          style={{
            backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary,
            borderColor: activeTheme.cardBorder
          }}
        >
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSaving(true);
              setSaveError(null);

              try {
                const updated = await requestJson<CollectionRecord>(`/api/collections/${currentCollection.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify(formState)
                });

                setCurrentCollection((current) => ({
                  ...current,
                  ...updated
                }));
              } catch (error) {
                setSaveError(error instanceof Error ? error.message : 'Unable to save collection');
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                  Title
                </span>
                <Input
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                  Visibility
                </span>
                <select
                  value={formState.visibility}
                  onChange={(event) =>
                    setFormState((current) => ({
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
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                Description
              </span>
              <Textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
              />
            </label>

            {saveError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            ) : null}

            <Button type="submit" disabled={isSaving} variant="primary" size="lg">
              <Pencil size={16} strokeWidth={2.1} />
              {isSaving ? 'Saving...' : 'Save collection'}
            </Button>
          </form>
        </section>

        <section
          className="rounded-soft border p-6 sm:p-8"
          style={{
            backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary,
            borderColor: activeTheme.cardBorder
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.badgeText }}>
                Items
              </p>
              <h2
                className="mt-2 font-[family-name:var(--font-display)] text-3xl"
                style={{ color: isDark ? '#f7f3ee' : '#17181d' }}
              >
                {collectionObjects.length} items in this collection
              </h2>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: activeTheme.badgeText }}>
              Page {itemsPage} of {itemsPageCount}
            </p>
          </div>

          <div className="mt-6 max-h-[34rem] overflow-y-auto pr-1">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setPickerError(null);
                  setPickerPage(1);
                  setIsPickerOpen(true);
                }}
                className="min-h-[220px] rounded-3xl border border-dashed p-5 text-left transition"
                style={{
                  backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted,
                  borderColor: activeTheme.cardBorder,
                  color: isDark ? '#f7f3ee' : '#17181d'
                }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: isDark ? activeTheme.heroPanel : activeTheme.badgeBg,
                        color: activeTheme.accent
                      }}
                    >
                      <Plus size={20} strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl">Add existing item</h3>
                    <p
                      className="mt-2 text-sm leading-6"
                      style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}
                    >
                      Open a modal finder for existing items and add them into this collection.
                    </p>
                  </div>
                </div>
              </button>

              {pagedItems.map((object) => (
                <ItemCard
                  key={object.id}
                  activeTheme={activeTheme}
                  isBusy={savingObjectId === object.id}
                  isDark={isDark}
                  label="Tap to remove"
                  object={object}
                  onClick={() => void updateObjectMembership(object, null)}
                />
              ))}

              {collectionObjects.length === 0 ? (
                <div
                  className="rounded-3xl border px-5 py-5 text-sm"
                  style={{
                    backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted,
                    borderColor: activeTheme.cardBorder,
                    color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText
                  }}
                >
                  This collection is empty. Use the first `+` card to open the existing-item finder.
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setItemsPage((current) => Math.max(1, current - 1))}
              disabled={itemsPage === 1}
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={() => setItemsPage((current) => Math.min(itemsPageCount, current + 1))}
              disabled={itemsPage === itemsPageCount}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </section>
      </div>

      <Dialog.Root open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 bg-ink/35" />
          <Dialog.Popup
            className="fixed left-1/2 top-1/2 z-30 flex max-h-[calc(100dvh-2rem)] w-[min(100%-1.5rem,72rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-soft border p-5 shadow-xl sm:p-6"
            style={{
              backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.badgeBg,
              borderColor: activeTheme.cardBorder
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.accent }}>
                  Existing item finder
                </p>
                <Dialog.Title
                  className="mt-1 font-[family-name:var(--font-display)] text-3xl"
                  style={{ color: isDark ? '#f7f3ee' : '#17181d' }}
                >
                  Add items to {currentCollection.title}
                </Dialog.Title>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}
                >
                  Select from existing items. After selection, the item is added and the full view list updates.
                </p>
              </div>

              <Dialog.Close
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: activeTheme.cardBorder, color: isDark ? '#f7f3ee' : '#17181d' }}
              >
                <X size={16} strokeWidth={2.1} />
                Close
              </Dialog.Close>
            </div>

            {pickerError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pickerError}
              </div>
            ) : null}

            <div className="mt-6 max-h-[32rem] overflow-y-auto pr-1">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedPickerItems.map((object) => (
                  <ItemCard
                    key={object.id}
                    activeTheme={activeTheme}
                    isBusy={savingObjectId === object.id}
                    isDark={isDark}
                    label="Tap to add"
                    object={object}
                    onClick={() => void updateObjectMembership(object, currentCollection.id)}
                  />
                ))}

                {availableObjects.length === 0 ? (
                  <div
                    className="rounded-3xl border px-5 py-5 text-sm"
                    style={{
                      backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted,
                      borderColor: activeTheme.cardBorder,
                      color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText
                    }}
                  >
                    No existing items are available to add.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: activeTheme.badgeText }}>
                Page {pickerPage} of {pickerPageCount}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setPickerPage((current) => Math.max(1, current - 1))}
                  disabled={pickerPage === 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={() => setPickerPage((current) => Math.min(pickerPageCount, current + 1))}
                  disabled={pickerPage === pickerPageCount}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isQrOpen} onOpenChange={setIsQrOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 bg-ink/35" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-30 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-soft">
            <ObjectQrCard
              title={currentCollection.title}
              publicUrl={getPublicCollectionUrl(currentCollection.publicId)}
              entityLabel="collection"
              actionSlot={
                <Dialog.Close className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold" style={{ borderColor: activeTheme.cardBorder, color: isDark ? '#f7f3ee' : '#17181d' }}>
                  Close
                </Dialog.Close>
              }
            />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
