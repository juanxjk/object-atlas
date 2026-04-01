'use client';

import { useEffect, useState } from 'react';
import type { ObjectMediaRecord, ObjectRecord } from '@object-atlas/types';

import { ObjectQrCard } from './object-qr-card';
import { filterObjectsByTitle } from '../lib/object-search';

type ObjectFormState = {
  title: string;
  description: string;
  story: string;
};

const emptyFormState: ObjectFormState = {
  title: '',
  description: '',
  story: ''
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
    story: object.story ?? ''
  };
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
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaItems, setMediaItems] = useState<ObjectMediaRecord[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const selectedObject = objects.find((object) => object.id === selectedId) ?? null;
  const editingObject = objects.find((object) => object.id === editingObjectId) ?? null;
  const filteredObjects = filterObjectsByTitle(objects, searchQuery);

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
        body: JSON.stringify(createFormState)
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
        body: JSON.stringify(editFormState)
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
              className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white"
            >
              New object
            </button>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
              Search by title
            </span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search object titles"
              className="w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0"
            />
          </label>

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
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{object.title}</p>
                          <p className="mt-1 text-sm text-ink/65">
                            {object.description ?? 'No description yet'}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                          {isSelected ? 'Open' : 'View'}
                        </span>
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
                        className="rounded-full border border-sand bg-white/80 px-4 py-2 text-sm font-semibold text-ink"
                      >
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

                  <button
                    type="button"
                    onClick={() => handleEditMode(selectedObject)}
                    className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                  >
                    Edit object
                  </button>
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
                      ? 'Upload images or PDFs for this object record.'
                      : 'Create an object first, then attach media.'}
                  </p>
                </div>

                <label
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    selectedObject
                      ? 'cursor-pointer bg-moss text-white'
                      : 'cursor-not-allowed bg-sand text-ink/55'
                  }`}
                >
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
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{mediaItem.originalFilename}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/55">
                            {mediaItem.mimeType}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                          {(mediaItem.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>

          {selectedObject ? (
            <ObjectQrCard publicId={selectedObject.publicId} title={selectedObject.title} />
          ) : null}
        </div>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/35 px-4 py-6">
          <div className="w-full max-w-xl rounded-soft border border-black/5 bg-white p-5 sm:p-6">
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
                className="rounded-full border border-sand px-3 py-2 text-sm font-semibold text-ink"
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreateSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Title</span>
                <input
                  required
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
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Description</span>
                <textarea
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
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Story</span>
                <textarea
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
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {isCreating ? 'Creating...' : 'Create object'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isEditModalOpen && editingObject ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/35 px-4 py-6">
          <div className="w-full max-w-xl rounded-soft border border-black/5 bg-white p-5 sm:p-6">
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
                className="rounded-full border border-sand px-3 py-2 text-sm font-semibold text-ink"
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleEditSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Title</span>
                <input
                  required
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
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Description</span>
                <textarea
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
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Story</span>
                <textarea
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
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {isEditingFromModal ? 'Saving...' : 'Save changes'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingObjectId(null);
                  }}
                  className="rounded-full border border-sand px-5 py-3 text-sm font-semibold text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
