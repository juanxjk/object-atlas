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
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';
import type { ObjectMediaRecord, ObjectRecord } from '@object-atlas/types';

import { ObjectQrCard } from './object-qr-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { readErrorMessage, readJsonResponse } from '../lib/http-response';
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
    throw new Error(await readErrorMessage(response));
  }

  return await readJsonResponse<T>(response);
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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
        throw new Error(await readErrorMessage(response));
      }

      const uploaded = await readJsonResponse<ObjectMediaRecord>(response);
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

  const handleDeleteObject = async (objectId: string) => {
    setDeleteTargetId(objectId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const objectId = deleteTargetId;
    
    setIsDeleting(true);
    setEditError(null);
    try {
      await requestObject(`/api/objects/${objectId}`, { method: 'DELETE' });
      setObjects((current) => current.filter((o) => o.id !== objectId));
      if (selectedId === objectId) {
        setSelectedId(null);
        setMobileView('list');
      }
      setIsEditModalOpen(false);
      setEditingObjectId(null);
      setDeleteTargetId(null);
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : 'Unable to delete object');
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
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

            <Button type="button" onClick={handleCreateMode} variant="soft">
              <Plus size={16} strokeWidth={2.2} />
              New object
            </Button>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
              Search by title
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink">
              <Search size={16} strokeWidth={2.1} className="shrink-0 text-ink/55" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search object titles"
                className="border-0 bg-transparent px-0 py-0"
              />
            </div>
          </label>

          {availableTags.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
                Filter by tag
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => setSelectedTagFilter(null)}
                  variant={!selectedTagFilter ? 'chip-active' : 'chip'}
                  size="sm"
                  className="text-xs uppercase tracking-[0.12em]"
                >
                  All tags
                </Button>
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(tag)}
                    variant={selectedTagFilter === tag ? 'chip-active' : 'chip'}
                    size="sm"
                    className="text-xs uppercase tracking-[0.12em]"
                  >
                    {tag}
                  </Button>
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
                    <Button
                      type="button"
                      onClick={() => handleSelect(object)}
                      variant="secondary"
                      className="w-full justify-start rounded-none border-0 bg-transparent p-0 text-left"
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
                    </Button>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                          Quick actions
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => handleEditMode(object)}
                          variant="secondary"
                          className="bg-white/80"
                        >
                          <Pencil size={16} strokeWidth={2.1} />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          onClick={() => handleDeleteObject(object.id)}
                          disabled={isDeleting}
                          variant="danger"
                          className="bg-white/80"
                        >
                          <Trash2 size={16} strokeWidth={2.1} />
                          Remove
                        </Button>
                      </div>
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
                    <Button
                      href={getPublicObjectUrl(selectedObject.publicId)}
                      target="_blank"
                      rel="noreferrer"
                      variant="secondary"
                      size="lg"
                    >
                      <ExternalLink size={16} strokeWidth={2.1} />
                      Open public page
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      variant="secondary"
                      size="lg"
                    >
                      <QrCode size={16} strokeWidth={2.1} />
                      Show QR code
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleEditMode(selectedObject)}
                      variant="primary"
                      size="lg"
                    >
                      <Pencil size={16} strokeWidth={2.1} />
                      Edit object
                    </Button>
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
                  <Input
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
                        <Button
                          type="button"
                          onClick={() => handleOpenPreview(mediaItem)}
                          variant="secondary"
                          className="mb-4 block w-full overflow-hidden rounded-2xl border border-black/5 bg-white p-0 text-left"
                        >
                          <img
                            src={getThumbnailUrl(mediaItem.storagePath) ?? ''}
                            alt={mediaItem.originalFilename}
                            className="h-48 w-full object-cover transition hover:scale-[1.02] sm:h-56"
                          />
                        </Button>
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

                              <Button
                                type="button"
                                onClick={() => handleDeleteMedia(mediaItem)}
                                disabled={deletingMediaId === mediaItem.id}
                                variant="danger"
                              >
                                <Trash2 size={16} strokeWidth={2.1} />
                                {deletingMediaId === mediaItem.id ? 'Removing...' : 'Remove'}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                onClick={() => handleSetPrimaryImage(mediaItem)}
                                variant="secondary"
                              >
                                <Star size={16} strokeWidth={2.1} />
                                Set as main image
                              </Button>

                              <Button
                                type="button"
                                onClick={() => handleDeleteMedia(mediaItem)}
                                disabled={deletingMediaId === mediaItem.id}
                                variant="danger"
                              >
                                <Trash2 size={16} strokeWidth={2.1} />
                                {deletingMediaId === mediaItem.id ? 'Removing...' : 'Remove'}
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 border-t border-black/5 pt-3">
                          <Button
                            type="button"
                            onClick={() => handleDeleteMedia(mediaItem)}
                            disabled={deletingMediaId === mediaItem.id}
                            variant="danger"
                          >
                            <Trash2 size={16} strokeWidth={2.1} />
                            {deletingMediaId === mediaItem.id ? 'Removing...' : 'Remove file'}
                          </Button>
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


      {/* ── Create Object Dialog ── */}
      <Dialog.Root
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setCreateError(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 min-h-dvh bg-ink/35 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-30 flex max-h-[calc(100dvh-3rem)] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-soft border border-black/5 bg-white p-5 shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-6">
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                  Create object
                </p>
                <Dialog.Title className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
                  New object record
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 text-ink/70">
                  Start with the essentials. You can add attachments and a QR-linked public page
                  right after creation.
                </Dialog.Description>
              </div>

              <Dialog.Close className="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-2 text-sm font-semibold text-ink">
                <X size={16} strokeWidth={2.1} />
                Close
              </Dialog.Close>
            </div>

            <form className="mt-6 min-h-0 space-y-4 overflow-y-auto pr-2" onSubmit={handleCreateSubmit}>
              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-ink">Title</span>
                  <span className="text-xs font-medium text-ink/55">
                    {createFormState.title.length}/{fieldLimits.title}
                  </span>
                </div>
                <Input
                  required
                  maxLength={fieldLimits.title}
                  value={createFormState.title}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
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
                <Input
                  value={createFormState.tags}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      tags: event.target.value
                    }))
                  }
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
                <Textarea
                  maxLength={fieldLimits.description}
                  value={createFormState.description}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  rows={3}
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
                    {createFormState.story.length}/{fieldLimits.story}
                  </span>
                </div>
                <Textarea
                  maxLength={fieldLimits.story}
                  value={createFormState.story}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      story: event.target.value
                    }))
                  }
                  rows={6}
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
                <Button
                  type="submit"
                  disabled={isCreating}
                  variant="primary"
                  size="lg"
                >
                  <Plus size={16} strokeWidth={2.1} />
                  {isCreating ? 'Creating...' : 'Create object'}
                </Button>

                <Dialog.Close
                  className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink"
                >
                  <X size={16} strokeWidth={2.1} />
                  Cancel
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Image Preview Dialog ── */}
      <Dialog.Root
        open={Boolean(previewMedia)}
        onOpenChange={(open) => { if (!open) handleClosePreview(); }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 min-h-dvh bg-ink/70 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-40 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-soft border border-black/5 bg-white p-5 shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-6">
            {previewMedia ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                      Image preview
                    </p>
                    <Dialog.Title className="mt-1 font-[family-name:var(--font-display)] text-2xl text-ink">
                      {previewMedia.originalFilename}
                    </Dialog.Title>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setPreviewZoom((current) => Math.max(1, current - 0.25))}
                      variant="secondary"
                    >
                      <ZoomOut size={16} strokeWidth={2.1} />
                      Zoom out
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setPreviewZoom((current) => Math.min(3, current + 0.25))}
                      variant="secondary"
                    >
                      <ZoomIn size={16} strokeWidth={2.1} />
                      Zoom in
                    </Button>

                    <Dialog.Close className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink">
                      <X size={16} strokeWidth={2.1} />
                      Close
                    </Dialog.Close>
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
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Edit Object Dialog ── */}
      <Dialog.Root
        open={isEditModalOpen && Boolean(editingObject)}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingObjectId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 min-h-dvh bg-ink/35 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-30 flex max-h-[calc(100dvh-3rem)] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-soft border border-black/5 bg-white p-5 shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-6">
            {editingObject ? (
              <>
                <div className="flex shrink-0 items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
                      Edit object
                    </p>
                    <Dialog.Title className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
                      {editingObject.title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm leading-6 text-ink/70">
                      Update the core information here, then return to the detail view for attachments
                      and QR access.
                    </Dialog.Description>
                  </div>

                  <Dialog.Close className="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-2 text-sm font-semibold text-ink">
                    <X size={16} strokeWidth={2.1} />
                    Close
                  </Dialog.Close>
                </div>

                <form className="mt-6 min-h-0 space-y-4 overflow-y-auto pr-2" onSubmit={handleEditSubmit}>
                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold text-ink">Title</span>
                      <span className="text-xs font-medium text-ink/55">
                        {editFormState.title.length}/{fieldLimits.title}
                      </span>
                    </div>
                    <Input
                      required
                      maxLength={fieldLimits.title}
                      value={editFormState.title}
                      onChange={(event) =>
                        setEditFormState((current) => ({
                          ...current,
                          title: event.target.value
                        }))
                      }
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
                        {parseTagsInput(editFormState.tags).length}/{fieldLimits.tagsPerObject}
                      </span>
                    </div>
                    <Input
                      value={editFormState.tags}
                      onChange={(event) =>
                        setEditFormState((current) => ({
                          ...current,
                          tags: event.target.value
                        }))
                      }
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
                        {editFormState.description.length}/{fieldLimits.description}
                      </span>
                    </div>
                    <Textarea
                      maxLength={fieldLimits.description}
                      value={editFormState.description}
                      onChange={(event) =>
                        setEditFormState((current) => ({
                          ...current,
                          description: event.target.value
                        }))
                      }
                      rows={3}
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
                    <Textarea
                      maxLength={fieldLimits.story}
                      value={editFormState.story}
                      onChange={(event) =>
                        setEditFormState((current) => ({
                          ...current,
                          story: event.target.value
                        }))
                      }
                      rows={6}
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

                  <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="submit"
                        disabled={isEditingFromModal || isDeleting}
                        variant="primary"
                        size="lg"
                      >
                        <Pencil size={16} strokeWidth={2.1} />
                        {isEditingFromModal ? 'Saving...' : 'Save changes'}
                      </Button>

                      <Dialog.Close
                        className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink"
                      >
                        <X size={16} strokeWidth={2.1} />
                        Cancel
                      </Dialog.Close>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleDeleteObject(editingObjectId!)}
                      disabled={isEditingFromModal || isDeleting}
                      variant="danger"
                      size="lg"
                    >
                      <Trash2 size={16} strokeWidth={2.1} />
                      {isDeleting ? 'Deleting...' : 'Delete object'}
                    </Button>
                  </div>
                </form>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── QR Code Dialog ── */}
      <Dialog.Root open={isQrModalOpen && Boolean(selectedObject)} onOpenChange={setIsQrModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 min-h-dvh bg-ink/35 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-30 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-soft transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            {selectedObject ? (
              <ObjectQrCard
                publicId={selectedObject.publicId}
                title={selectedObject.title}
                actionSlot={
                  <Dialog.Close className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink">
                    <X size={16} strokeWidth={2.1} />
                    Close
                  </Dialog.Close>
                }
              />
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Delete Confirmation AlertDialog ── */}
      <AlertDialog.Root
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-ink/35 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-soft border border-black/5 bg-white p-6 shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <AlertDialog.Title className="font-[family-name:var(--font-display)] text-2xl text-ink">
              Delete this object?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-6 text-ink/70">
              This will permanently remove the object and all its attached media. This action cannot
              be undone.
            </AlertDialog.Description>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AlertDialog.Close className="inline-flex items-center justify-center gap-2 rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink">
                Cancel
              </AlertDialog.Close>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                variant="danger"
                className="border-red-600 bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 size={16} strokeWidth={2.1} />
                {isDeleting ? 'Deleting...' : 'Delete object'}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
