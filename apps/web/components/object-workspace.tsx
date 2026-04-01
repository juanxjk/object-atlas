'use client';

import {
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  QrCode,
  Search,
  Star,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ObjectMediaRecord, ObjectRecord } from '@object-atlas/types';

import { ObjectQrCard } from './object-qr-card';
import { filterObjectsByTitle } from '../lib/object-search';

type ObjectFormState = {
  title: string;
  description: string;
  story: string;
  tags: string;
};

const emptyFormState: ObjectFormState = {
  title: '',
  description: '',
  story: '',
  tags: ''
};

const fieldLimits = {
  title: 160,
  description: 500,
  story: 10000,
  tag: 40,
  tagsPerObject: 12,
  uploadSizeMb: 10
} as const;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function requestObject<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? 'Request failed');
  }

  return (await response.json()) as T;
}

function toFormState(object: ObjectRecord): ObjectFormState {
  return {
    title: object.title,
    description: object.description ?? '',
    story: object.story ?? '',
    tags: object.tags.join(', ')
  };
}

function getThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath) {
    return null;
  }

  return `${apiBaseUrl}/uploads/${thumbnailPath}`;
}

function getPublicObjectUrl(publicId: string): string {
  return `${publicAppUrl}/objects/${publicId}`;
}

function parseTagsInput(value: string): string[] {
  const parsed = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter(
      (tag, index, collection) =>
        collection.findIndex((candidate) => candidate.toLowerCase() === tag.toLowerCase()) === index
    );

  return parsed.slice(0, fieldLimits.tagsPerObject);
}

export function ObjectWorkspace({
  initialObjects
}: {
  initialObjects: ObjectRecord[];
}) {
  const [mobileView, setMobileView] = useState<'list' | 'editor'>(
    initialObjects[0]?.id ? 'editor' : 'list'
  );
  const [objects, setObjects] = useState<ObjectRecord[]>(initialObjects);
  const [createFormState, setCreateFormState] = useState<ObjectFormState>(emptyFormState);
  const [editFormState, setEditFormState] = useState<ObjectFormState>(emptyFormState);
  const [selectedId, setSelectedId] = useState<string | null>(initialObjects[0]?.id ?? null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingFromModal, setIsEditingFromModal] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<ObjectMediaRecord[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<ObjectMediaRecord | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  const selectedObject = objects.find((object) => object.id === selectedId) ?? null;
  const editingObject = objects.find((object) => object.id === editingObjectId) ?? null;
  const filteredObjects = filterObjectsByTitle(objects, searchQuery, selectedTagFilter);
  const availableTags = Array.from(
    new Set(
      objects.flatMap((object) => object.tags).sort((left, right) => left.localeCompare(right))
    )
  );

  useEffect(() => {
    async function loadMedia(): Promise<void> {
      if (!selectedId) {
        setMediaItems([]);
        setMediaError(null);
        return;
      }

      setIsLoadingMedia(true);
      setMediaError(null);

      try {
        const items = await requestObject<ObjectMediaRecord[]>(`/api/objects/${selectedId}/media`);
        setMediaItems(items);
      } catch (requestError) {
        setMediaError(
          requestError instanceof Error ? requestError.message : 'Unable to load attachments'
        );
      } finally {
        setIsLoadingMedia(false);
      }
    }

    void loadMedia();
  }, [selectedId]);

  const handleSelect = (object: ObjectRecord) => {
    setSelectedId(object.id);
    setMobileView('editor');
  };

  const handleCreateMode = () => {
    setCreateFormState(emptyFormState);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleEditMode = (object: ObjectRecord) => {
    setEditingObjectId(object.id);
    setEditFormState(toFormState(object));
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const created = await requestObject<ObjectRecord>('/api/objects', {
        method: 'POST',
        body: JSON.stringify({
          ...createFormState,
          tags: parseTagsInput(createFormState.tags)
        })
      });

      setObjects((current) => [created, ...current]);
      setSelectedId(created.id);
      setMediaItems([]);
      setMediaError(null);
      setMobileView('editor');
      setIsCreateModalOpen(false);
      setCreateFormState(emptyFormState);
    } catch (requestError) {
      setCreateError(
        requestError instanceof Error ? requestError.message : 'Unable to create object'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !selectedId) {
      return;
    }

    setIsUploadingMedia(true);
    setMediaError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiBaseUrl}/api/objects/${selectedId}/media`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? 'Unable to upload media');
      }

      const uploaded = (await response.json()) as ObjectMediaRecord;
      setMediaItems((current) => [uploaded, ...current]);
      if (uploaded.mimeType.startsWith('image/')) {
        setObjects((current) =>
          current.map((object) =>
            object.id === selectedId
              ? {
                  ...object,
                  primaryFileId: uploaded.isPrimary ? uploaded.fileId : object.primaryFileId,
                  thumbnailPath:
                    uploaded.isPrimary || !object.thumbnailPath
                      ? uploaded.storagePath
                      : object.thumbnailPath
                }
              : object
          )
        );
      }
      event.target.value = '';
    } catch (requestError) {
      setMediaError(requestError instanceof Error ? requestError.message : 'Unable to upload media');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingObjectId) {
      return;
    }

    setIsEditingFromModal(true);
    setEditError(null);

    try {
      const updated = await requestObject<ObjectRecord>(`/api/objects/${editingObjectId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...editFormState,
          tags: parseTagsInput(editFormState.tags)
        })
      });

      setObjects((current) =>
        current.map((object) => (object.id === updated.id ? updated : object))
      );
      setSelectedId(updated.id);
      setIsEditModalOpen(false);
      setEditingObjectId(null);
      setMobileView('editor');
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'Unable to save object');
    } finally {
      setIsEditingFromModal(false);
    }
  };

  const handleSetPrimaryImage = async (mediaItem: ObjectMediaRecord) => {
    if (!selectedId || mediaItem.isPrimary) {
      return;
    }

    try {
      const updated = await requestObject<ObjectRecord>(
        `/api/objects/${selectedId}/primary-media/${mediaItem.id}`,
        {
          method: 'PATCH'
        }
      );

      setObjects((current) =>
        current.map((object) => (object.id === updated.id ? updated : object))
      );
      setMediaItems((current) =>
        current.map((item) => ({
          ...item,
          isPrimary: item.id === mediaItem.id
        }))
      );
    } catch (requestError) {
      setMediaError(
        requestError instanceof Error ? requestError.message : 'Unable to set main image'
      );
    }
  };

  const handleDeleteMedia = async (mediaItem: ObjectMediaRecord) => {
    if (!selectedId) {
      return;
    }

    setDeletingMediaId(mediaItem.id);
    setMediaError(null);

    try {
      const updated = await requestObject<ObjectRecord>(
        `/api/objects/${selectedId}/media/${mediaItem.id}`,
        {
          method: 'DELETE'
        }
      );

      setObjects((current) =>
        current.map((object) => (object.id === updated.id ? updated : object))
      );
      setMediaItems((current) => current.filter((item) => item.id !== mediaItem.id));
    } catch (requestError) {
      setMediaError(
        requestError instanceof Error ? requestError.message : 'Unable to remove attachment'
      );
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleOpenPreview = (mediaItem: ObjectMediaRecord) => {
    setPreviewMedia(mediaItem);
    setPreviewZoom(1);
  };

  const handleClosePreview = () => {
    setPreviewMedia(null);
    setPreviewZoom(1);
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <article
          id="object-listing"
          className={`rounded-soft border border-black/5 bg-white/85 p-5 sm:p-6 ${
            mobileView === 'list' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
                Object records
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-ink">
                Manage the first collection slice
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCreateMode}
              className="inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} strokeWidth={2.2} />
              New object
            </button>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
              Search by title
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink">
              <Search size={16} strokeWidth={2.1} className="shrink-0 text-ink/55" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search object titles"
                className="w-full bg-transparent text-sm text-ink outline-none ring-0 placeholder:text-ink/45"
              />
            </div>
          </label>

          {availableTags.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
                Filter by tag
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTagFilter(null)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    !selectedTagFilter ? 'bg-ink text-white' : 'bg-clay text-ink/70'
                  }`}
                >
                  All tags
                </button>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(tag)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                      selectedTagFilter === tag ? 'bg-ember text-white' : 'bg-clay text-ink/70'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {objects.length === 0 ? (
              <div className="rounded-2xl bg-clay px-4 py-4 text-sm text-ink/70">
                No object records yet. Start by creating the first one.
              </div>
            ) : filteredObjects.length === 0 ? (
              <div className="rounded-2xl bg-clay px-4 py-4 text-sm text-ink/70">
                No objects match that title search.
              </div>
            ) : (
              filteredObjects.map((object) => {
                const isSelected = object.id === selectedId;

                return (
                  <div
                    key={object.id}
                    className={`w-full rounded-2xl border px-4 py-4 transition ${
                      isSelected ? 'border-ember bg-[#fff7f1]' : 'border-sand bg-clay'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(object)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-3">
                        {object.thumbnailPath ? (
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-white">
                            <img
                              src={getThumbnailUrl(object.thumbnailPath) ?? ''}
                              alt={`Thumbnail for ${object.title}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-sand bg-white/70 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                            <ImageIcon size={16} strokeWidth={2} />
                            <span className="mt-1">No image</span>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{object.title}</p>
                              <p className="mt-1 text-sm text-ink/65">
                                {object.description ?? 'No description yet'}
                              </p>
                              {object.tags.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {object.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-moss"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                              {isSelected ? 'Open' : 'View'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                          Quick actions
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEditMode(object)}
                        className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/80 px-4 py-2 text-sm font-semibold text-ink"
                      >
                        <Pencil size={16} strokeWidth={2.1} />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <div
          className={`space-y-4 ${mobileView === 'editor' ? 'block' : 'hidden lg:block'}`}
        >
          <article
            id="object-editor"
            className="rounded-soft border border-black/5 bg-white/90 p-5 sm:p-6"
          >
            {selectedObject ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                      Object details
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
                      {selectedObject.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-ink/70">
                      Review the object summary here, then use edit when you want to change the
                      core fields.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={getPublicObjectUrl(selectedObject.publicId)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-5 py-3 text-sm font-semibold text-ink"
                    >
                      <ExternalLink size={16} strokeWidth={2.1} />
                      Open public page
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-5 py-3 text-sm font-semibold text-ink"
                    >
                      <QrCode size={16} strokeWidth={2.1} />
                      Show QR code
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditMode(selectedObject)}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Pencil size={16} strokeWidth={2.1} />
                      Edit object
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl bg-clay px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                      Description
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink/80">
                      {selectedObject.description ?? 'No description yet.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-clay px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                      Story
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink/80">
                      {selectedObject.story ?? 'No story has been added yet.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-clay px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                      Tags
                    </p>
                    {selectedObject.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedObject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-ink/70">No tags yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : null}

            {!selectedObject ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                  Object details
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
                  Select an object from the listing
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Use the object listing to open an existing record, or create a new one from the
                  listing panel.
                </p>
              </>
            ) : null}

            <div className="mt-8 border-t border-black/5 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
                    Attachments
                  </p>
                  <p className="mt-1 text-sm text-ink/65">
                    {selectedObject
                      ? `Upload images or PDFs for this object record. Files up to ${fieldLimits.uploadSizeMb} MB.`
                      : 'Create an object first, then attach media.'}
                  </p>
                </div>

                <label
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    selectedObject
                      ? 'cursor-pointer bg-moss text-white'
                      : 'cursor-not-allowed bg-sand text-ink/55'
                  }`}
                >
                  <Upload size={16} strokeWidth={2.1} />
                  Add file
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    disabled={!selectedObject || isUploadingMedia}
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4 space-y-3">
                {isLoadingMedia ? (
                  <div className="rounded-2xl bg-clay px-4 py-3 text-sm text-ink/70">
                    Loading attachments...
                  </div>
                ) : null}

                {isUploadingMedia ? (
                  <div className="rounded-2xl bg-[#edf5ef] px-4 py-3 text-sm text-moss">
                    Uploading file...
                  </div>
                ) : null}

                {mediaError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {mediaError}
                  </div>
                ) : null}

                {!selectedObject ? (
                  <div className="rounded-2xl bg-clay px-4 py-3 text-sm text-ink/70">
                    Select or create an object to manage attachments.
                  </div>
                ) : mediaItems.length === 0 && !isLoadingMedia ? (
                  <div className="rounded-2xl bg-clay px-4 py-3 text-sm text-ink/70">
                    No attachments yet. Upload the first image or document.
                  </div>
                ) : (
                  mediaItems.map((mediaItem) => (
                    <div
                      key={mediaItem.id}
                      className="rounded-2xl border border-sand bg-clay px-4 py-4 text-sm text-ink"
                    >
                      {mediaItem.mimeType.startsWith('image/') ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(mediaItem)}
                          className="mb-4 block w-full overflow-hidden rounded-2xl border border-black/5 bg-white text-left"
                        >
                          <img
                            src={getThumbnailUrl(mediaItem.storagePath) ?? ''}
                            alt={mediaItem.originalFilename}
                            className="h-48 w-full object-cover transition hover:scale-[1.02] sm:h-56"
                          />
                        </button>
                      ) : null}

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{mediaItem.originalFilename}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/55">
                            {mediaItem.mimeType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {mediaItem.isPrimary ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ember">
                              <Star size={12} strokeWidth={2.2} />
                              Main
                            </span>
                          ) : null}
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                            {(mediaItem.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>

                      {mediaItem.mimeType.startsWith('image/') ? (
                        <div className="mt-3 border-t border-black/5 pt-3">
                          {mediaItem.isPrimary ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-medium text-ink/55">
                                This image is currently used as the main thumbnail.
                              </p>

                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(mediaItem)}
                                disabled={deletingMediaId === mediaItem.id}
                                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                              >
                                <Trash2 size={16} strokeWidth={2.1} />
                                {deletingMediaId === mediaItem.id ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(mediaItem)}
                                className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-ink"
                              >
                                <Star size={16} strokeWidth={2.1} />
                                Set as main image
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(mediaItem)}
                                disabled={deletingMediaId === mediaItem.id}
                                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                              >
                                <Trash2 size={16} strokeWidth={2.1} />
                                {deletingMediaId === mediaItem.id ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 border-t border-black/5 pt-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(mediaItem)}
                            disabled={deletingMediaId === mediaItem.id}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                          >
                            <Trash2 size={16} strokeWidth={2.1} />
                            {deletingMediaId === mediaItem.id ? 'Removing...' : 'Remove file'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>

        </div>
      </div>

      {isCreateModalOpen ? (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-ink/35 px-4 py-6"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-soft border border-black/5 bg-white p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                  Create object
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
                  New object record
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Start with the essentials. You can add attachments and a QR-linked public page
                  right after creation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-2 text-sm font-semibold text-ink"
              >
                <X size={16} strokeWidth={2.1} />
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreateSubmit}>
              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Title</span>
                  <span className="text-xs font-medium text-ink/55">
                    {createFormState.title.length}/{fieldLimits.title}
                  </span>
                </div>
                <input
                  required
                  maxLength={fieldLimits.title}
                  value={createFormState.title}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="Object title"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Up to {fieldLimits.title} characters.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Tags</span>
                  <span className="text-xs font-medium text-ink/55">
                    {parseTagsInput(createFormState.tags).length}/{fieldLimits.tagsPerObject}
                  </span>
                </div>
                <input
                  value={createFormState.tags}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      tags: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="archive, bronze, restoration"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Comma-separated tags, up to {fieldLimits.tagsPerObject} tags and {fieldLimits.tag}{' '}
                  characters each.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Description</span>
                  <span className="text-xs font-medium text-ink/55">
                    {createFormState.description.length}/{fieldLimits.description}
                  </span>
                </div>
                <textarea
                  maxLength={fieldLimits.description}
                  value={createFormState.description}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="Short summary for management and public display"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Up to {fieldLimits.description} characters.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Tags</span>
                  <span className="text-xs font-medium text-ink/55">
                    {parseTagsInput(editFormState.tags).length}/{fieldLimits.tagsPerObject}
                  </span>
                </div>
                <input
                  value={editFormState.tags}
                  onChange={(event) =>
                    setEditFormState((current) => ({
                      ...current,
                      tags: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="archive, bronze, restoration"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Comma-separated tags, up to {fieldLimits.tagsPerObject} tags and {fieldLimits.tag}{' '}
                  characters each.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Story</span>
                  <span className="text-xs font-medium text-ink/55">
                    {createFormState.story.length}/{fieldLimits.story}
                  </span>
                </div>
                <textarea
                  maxLength={fieldLimits.story}
                  value={createFormState.story}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      story: event.target.value
                    }))
                  }
                  rows={6}
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="Historical context, significance, or narrative"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Up to {fieldLimits.story} characters.
                </p>
              </label>

              {createError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  <Plus size={16} strokeWidth={2.1} />
                  {isCreating ? 'Creating...' : 'Create object'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink"
                >
                  <X size={16} strokeWidth={2.1} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {previewMedia ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/70 px-4 py-6"
          onClick={handleClosePreview}
        >
          <div
            className="w-full max-w-5xl rounded-soft border border-black/5 bg-white p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                  Image preview
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-ink">
                  {previewMedia.originalFilename}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((current) => Math.max(1, current - 0.25))}
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink"
                >
                  <ZoomOut size={16} strokeWidth={2.1} />
                  Zoom out
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewZoom((current) => Math.min(3, current + 0.25))}
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink"
                >
                  <ZoomIn size={16} strokeWidth={2.1} />
                  Zoom in
                </button>

                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink"
                >
                  <X size={16} strokeWidth={2.1} />
                  Close
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-auto rounded-3xl bg-clay px-4 py-4">
              <div className="flex min-h-[40vh] items-center justify-center">
                <img
                  src={getThumbnailUrl(previewMedia.storagePath) ?? ''}
                  alt={previewMedia.originalFilename}
                  className="max-h-[70vh] w-auto max-w-full origin-center rounded-2xl bg-white transition-transform duration-200"
                  style={{ transform: `scale(${previewZoom})` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isEditModalOpen && editingObject ? (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-ink/35 px-4 py-6"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingObjectId(null);
          }}
        >
          <div
            className="w-full max-w-xl rounded-soft border border-black/5 bg-white p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                  Edit object
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
                  {editingObject.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Update the core information here, then return to the detail view for attachments
                  and QR access.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingObjectId(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-2 text-sm font-semibold text-ink"
              >
                <X size={16} strokeWidth={2.1} />
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleEditSubmit}>
              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Title</span>
                  <span className="text-xs font-medium text-ink/55">
                    {editFormState.title.length}/{fieldLimits.title}
                  </span>
                </div>
                <input
                  required
                  maxLength={fieldLimits.title}
                  value={editFormState.title}
                  onChange={(event) =>
                    setEditFormState((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="Object title"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Up to {fieldLimits.title} characters.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Description</span>
                  <span className="text-xs font-medium text-ink/55">
                    {editFormState.description.length}/{fieldLimits.description}
                  </span>
                </div>
                <textarea
                  maxLength={fieldLimits.description}
                  value={editFormState.description}
                  onChange={(event) =>
                    setEditFormState((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="Short summary for management and public display"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Up to {fieldLimits.description} characters.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Story</span>
                  <span className="text-xs font-medium text-ink/55">
                    {editFormState.story.length}/{fieldLimits.story}
                  </span>
                </div>
                <textarea
                  maxLength={fieldLimits.story}
                  value={editFormState.story}
                  onChange={(event) =>
                    setEditFormState((current) => ({
                      ...current,
                      story: event.target.value
                    }))
                  }
                  rows={6}
                  className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
                  placeholder="Historical context, significance, or narrative"
                />
                <p className="mt-2 text-xs text-ink/55">
                  Up to {fieldLimits.story} characters.
                </p>
              </label>

              {editError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isEditingFromModal}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  <Pencil size={16} strokeWidth={2.1} />
                  {isEditingFromModal ? 'Saving...' : 'Save changes'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingObjectId(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink"
                >
                  <X size={16} strokeWidth={2.1} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isQrModalOpen && selectedObject ? (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-ink/35 px-4 py-6"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="w-full max-w-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <ObjectQrCard
              publicId={selectedObject.publicId}
              title={selectedObject.title}
              actionSlot={
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink"
                >
                  <X size={16} strokeWidth={2.1} />
                  Close
                </button>
              }
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
