'use client';

import {
  Download,
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
import { useEffect, useRef, useState } from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';
import type { CollectionRecord, ObjectMediaRecord, ObjectRecord } from '@object-atlas/types';

import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { createLocalObjectRecord, updateLocalObjectRecord } from '../lib/local-session/session';
import { clearLocalSessionSnapshot, loadOrCreateLocalSessionSnapshot, saveLocalSessionSnapshot } from '../lib/local-session/store';
import {
  createLocalSessionSnapshot,
  parseLocalSession,
  serializeLocalSession
} from '../lib/local-session/serialization';
import { filterObjectsByTitle } from '../lib/object-search';

type ObjectFormState = {
  title: string;
  description: string;
  story: string;
  tags: string;
  collectionId: string;
};

const emptyFormState: ObjectFormState = {
  title: '',
  description: '',
  story: '',
  tags: '',
  collectionId: ''
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

function toFormState(object: ObjectRecord): ObjectFormState {
  return {
    title: object.title,
    description: object.description ?? '',
    story: object.story ?? '',
    tags: object.tags.join(', '),
    collectionId: object.collection?.id ?? ''
  };
}

function getThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath) {
    return null;
  }

  return `${apiBaseUrl}/uploads/${thumbnailPath}`;
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
  initialCollectionFilter,
  initialCollections,
  initialObjects
}: {
  initialCollectionFilter?: string | null;
  initialCollections: CollectionRecord[];
  initialObjects: ObjectRecord[];
}) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>(
    initialObjects[0]?.id ? 'editor' : 'list'
  );
  const [objects, setObjects] = useState<ObjectRecord[]>(initialObjects);
  const [collections, setCollections] = useState<CollectionRecord[]>(initialCollections);
  const [createFormState, setCreateFormState] = useState<ObjectFormState>(emptyFormState);
  const [editFormState, setEditFormState] = useState<ObjectFormState>(emptyFormState);
  const [selectedId, setSelectedId] = useState<string | null>(initialObjects[0]?.id ?? null);
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<{
    tone: 'error' | 'info' | 'success';
    text: string;
  } | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingFromModal, setIsEditingFromModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string | null>(
    initialCollectionFilter ?? null
  );
  const [mediaItems, setMediaItems] = useState<ObjectMediaRecord[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<ObjectMediaRecord | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  const selectedObject = objects.find((object) => object.id === selectedId) ?? null;
  const editingObject = objects.find((object) => object.id === editingObjectId) ?? null;
  const filteredObjects = filterObjectsByTitle(objects, searchQuery, selectedTagFilter).filter(
    (object) => !selectedCollectionFilter || object.collection?.id === selectedCollectionFilter
  );
  const availableTags = Array.from(
    new Set(
      objects.flatMap((object) => object.tags).sort((left, right) => left.localeCompare(right))
    )
  );
  const workspacePanelBg = isDark ? activeTheme.heroPanel : activeTheme.badgeBg;
  const workspacePanelBorder = activeTheme.cardBorder;
  const workspaceSectionBg = isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted;
  const workspaceCardBg = isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary;
  const workspaceSelectedCardBg = isDark ? activeTheme.previewPanel : activeTheme.heroSurface;
  const workspacePrimaryText = isDark ? '#f7f3ee' : '#17181d';
  const workspaceMutedText = isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText;
  const workspaceSoftText = isDark ? 'rgba(255,255,255,0.58)' : activeTheme.badgeText;
  const modalBg = isDark ? activeTheme.metricsPanel : activeTheme.badgeBg;
  const modalFieldBg = isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted;
  const modalFieldText = isDark ? '#f7f3ee' : '#17181d';
  const modalHelperText = isDark ? 'rgba(255,255,255,0.58)' : activeTheme.cardMetaText;

  useEffect(() => {
    const { snapshot, source } = loadOrCreateLocalSessionSnapshot({
      seedCollections: initialCollections,
      seedObjects: initialObjects
    });

    setCollections(snapshot.collections);
    setSessionCreatedAt(snapshot.meta.createdAt);
    setObjects(snapshot.objects);
    setSelectedId(snapshot.objects[0]?.id ?? null);
    setMobileView(snapshot.objects[0]?.id ? 'editor' : 'list');
    setMediaItems([]);
    setMediaError(null);
    setIsSessionReady(true);

    if (source === 'seed') {
      setSessionMessage({
        text: 'Local session initialized from the available starting data for this workspace.',
        tone: 'info'
      });
    }
  }, [initialCollections, initialObjects]);

  useEffect(() => {
    if (!isSessionReady) {
      return;
    }

    saveLocalSessionSnapshot(
      createLocalSessionSnapshot({
        collections,
        createdAt: sessionCreatedAt ?? undefined,
        objects
      })
    );
  }, [collections, isSessionReady, objects, sessionCreatedAt]);

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
      const title = createFormState.title.trim();

      if (!title) {
        throw new Error('Title is required');
      }

      const created = createLocalObjectRecord(
        {
          collectionId: createFormState.collectionId || null,
          description: createFormState.description,
          story: createFormState.story,
          tags: parseTagsInput(createFormState.tags),
          title
        },
        collections
      );

      setObjects((current) => [created, ...current]);
      setSelectedId(created.id);
      setMediaItems([]);
      setMediaError(null);
      setMobileView('editor');
      setIsCreateModalOpen(false);
      setCreateFormState(emptyFormState);
      setSessionMessage({
        text: `Saved "${created.title}" to this local session.`,
        tone: 'success'
      });
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

    setMediaError(null);
    setMediaError(
      `"${file.name}" was not uploaded. Attachments are not available in local-session mode yet.`
    );
    event.target.value = '';
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingObjectId) {
      return;
    }

    setIsEditingFromModal(true);
    setEditError(null);

    try {
      const title = editFormState.title.trim();

      if (!title) {
        throw new Error('Title is required');
      }

      if (!editingObject) {
        throw new Error('Object not found in this local session');
      }

      const updated = updateLocalObjectRecord(
        editingObject,
        {
          collectionId: editFormState.collectionId || null,
          description: editFormState.description,
          story: editFormState.story,
          tags: parseTagsInput(editFormState.tags),
          title
        },
        collections
      );

      setObjects((current) =>
        current.map((object) => (object.id === updated.id ? updated : object))
      );
      setSelectedId(updated.id);
      setIsEditModalOpen(false);
      setEditingObjectId(null);
      setMobileView('editor');
      setSessionMessage({
        text: `Saved updates to "${updated.title}" in this local session.`,
        tone: 'success'
      });
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
      const deletedObject = objects.find((object) => object.id === objectId);

      setObjects((current) => current.filter((o) => o.id !== objectId));
      if (selectedId === objectId) {
        const nextSelectedId = objects.find((object) => object.id !== objectId)?.id ?? null;
        setSelectedId(nextSelectedId);
        setMobileView(nextSelectedId ? 'editor' : 'list');
      }
      setIsEditModalOpen(false);
      setEditingObjectId(null);
      setDeleteTargetId(null);
      setSessionMessage({
        text: deletedObject
          ? `Removed "${deletedObject.title}" from this local session.`
          : 'Removed the object from this local session.',
        tone: 'success'
      });
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

    setMediaError('Main-image changes are not available in local-session mode yet.');
  };

  const handleDeleteMedia = async (mediaItem: ObjectMediaRecord) => {
    if (!selectedId) {
      return;
    }

    setDeletingMediaId(mediaItem.id);
    setMediaError(null);

    setMediaError('Attachment removal is not available in local-session mode yet.');
    setDeletingMediaId(null);
  };

  const handleOpenPreview = (mediaItem: ObjectMediaRecord) => {
    setPreviewMedia(mediaItem);
    setPreviewZoom(1);
  };

  const handleClosePreview = () => {
    setPreviewMedia(null);
    setPreviewZoom(1);
  };

  const handleExportSession = () => {
    const serializedSession = serializeLocalSession(
      createLocalSessionSnapshot({
        collections,
        createdAt: sessionCreatedAt ?? undefined,
        objects
      })
    );
    const sessionBlob = new Blob([serializedSession], {
      type: 'application/json'
    });
    const sessionUrl = window.URL.createObjectURL(sessionBlob);
    const link = document.createElement('a');
    const exportDate = new Date().toISOString().slice(0, 10);

    link.href = sessionUrl;
    link.download = `object-atlas-local-session-${exportDate}.json`;
    link.click();
    window.URL.revokeObjectURL(sessionUrl);

    setSessionMessage({
      text: 'Exported the current local session to a file.',
      tone: 'success'
    });
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportSession = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const serializedSession = await file.text();
      const snapshot = parseLocalSession(serializedSession);

      setCollections(snapshot.collections);
      setObjects(snapshot.objects);
      setSessionCreatedAt(snapshot.meta.createdAt);
      setSearchQuery('');
      setSelectedCollectionFilter(null);
      setSelectedTagFilter(null);
      setSelectedId(snapshot.objects[0]?.id ?? null);
      setMobileView(snapshot.objects[0]?.id ? 'editor' : 'list');
      setMediaItems([]);
      setMediaError(null);
      setSessionMessage({
        text: `Imported "${file.name}" into this local session.`,
        tone: 'success'
      });
    } catch (error) {
      setSessionMessage({
        text: error instanceof Error ? error.message : 'Unable to import the selected file.',
        tone: 'error'
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleResetSession = () => {
    clearLocalSessionSnapshot();
    setCollections(initialCollections);
    setObjects([]);
    setSessionCreatedAt(new Date().toISOString());
    setSearchQuery('');
    setSelectedCollectionFilter(initialCollectionFilter ?? null);
    setSelectedTagFilter(null);
    setSelectedId(null);
    setMobileView('list');
    setMediaItems([]);
    setMediaError(null);
    setSessionMessage({
      text: 'Cleared the current local session on this browser.',
      tone: 'success'
    });
  };

  return (
    <section className="space-y-4">
      <div
        className="rounded-2xl border px-4 py-4"
        style={{
          backgroundColor: workspaceSectionBg,
          borderColor: workspacePanelBorder,
          color: workspacePrimaryText
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: activeTheme.accent }}
            >
              Local session
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: workspaceMutedText }}>
              Records in this workspace are stored in this browser. Export to a file if you want a
              portable backup, or import a saved local-session file to restore it here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportSession}
              className="hidden"
            />
            <Button type="button" onClick={handleExportSession} variant="secondary">
              <Download size={16} strokeWidth={2.1} />
              Export file
            </Button>
            <Button type="button" onClick={handleImportClick} variant="secondary">
              <Upload size={16} strokeWidth={2.1} />
              Import file
            </Button>
            <Button type="button" onClick={handleResetSession} variant="danger">
              <Trash2 size={16} strokeWidth={2.1} />
              Reset session
            </Button>
          </div>
        </div>

        {sessionMessage ? (
          <div
            className="mt-4 rounded-2xl border px-4 py-3 text-sm"
            style={{
              backgroundColor:
                sessionMessage.tone === 'error'
                  ? isDark
                    ? 'rgba(248, 81, 73, 0.12)'
                    : '#fff5f5'
                  : sessionMessage.tone === 'success'
                    ? isDark
                      ? 'rgba(78, 163, 107, 0.16)'
                      : '#edf5ef'
                    : isDark
                      ? activeTheme.metricsPanel
                      : activeTheme.badgeBg,
              borderColor:
                sessionMessage.tone === 'error'
                  ? isDark
                    ? 'rgba(248, 81, 73, 0.35)'
                    : '#f3b7bd'
                  : workspacePanelBorder,
              color:
                sessionMessage.tone === 'error'
                  ? '#d1242f'
                  : sessionMessage.tone === 'success'
                    ? '#1e6b37'
                    : workspacePrimaryText
            }}
          >
            {sessionMessage.text}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <article
          id="object-listing"
          className={`rounded-soft border p-5 sm:p-6 ${
            mobileView === 'list' ? 'block' : 'hidden lg:block'
          }`}
          style={{
            backgroundColor: workspacePanelBg,
            borderColor: workspacePanelBorder
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: activeTheme.badgeText }}
              >
                Object records
              </p>
              <h2
                className="mt-1 font-[family-name:var(--font-display)] text-2xl"
                style={{ color: workspacePrimaryText }}
              >
                Manage the first collection slice
              </h2>
            </div>

            <Button type="button" onClick={handleCreateMode} variant="soft">
              <Plus size={16} strokeWidth={2.2} />
              New object
            </Button>
          </div>

          <label className="mt-5 block">
            <span
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: workspaceSoftText }}
            >
              Search by title
            </span>
            <div
              className="flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-sm"
              style={{
                backgroundColor: workspaceSectionBg,
                borderColor: workspacePanelBorder,
                color: workspacePrimaryText
              }}
            >
              <Search
                size={14}
                strokeWidth={2.1}
                className="shrink-0"
                style={{ color: workspaceSoftText }}
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search titles"
                className="border-0 bg-transparent px-0 py-0 text-sm"
                style={{ color: workspacePrimaryText }}
              />
            </div>
          </label>

          {availableTags.length > 0 ? (
            <div className="mt-4">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: workspaceSoftText }}
              >
                Filter by tag
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => setSelectedTagFilter(null)}
                  variant={!selectedTagFilter ? 'chip-active' : 'chip'}
                  size="sm"
                  className="text-xs uppercase tracking-[0.12em]"
                  style={{
                    backgroundColor: !selectedTagFilter
                      ? activeTheme.chipActiveBg
                      : activeTheme.chipBg,
                    borderColor: !selectedTagFilter
                      ? activeTheme.chipActiveBg
                      : activeTheme.cardBorder,
                    color: !selectedTagFilter
                      ? activeTheme.chipActiveText
                      : activeTheme.chipText
                  }}
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
                    style={{
                      backgroundColor:
                        selectedTagFilter === tag
                          ? activeTheme.chipActiveBg
                          : activeTheme.chipBg,
                      borderColor:
                        selectedTagFilter === tag
                          ? activeTheme.chipActiveBg
                          : activeTheme.cardBorder,
                      color:
                        selectedTagFilter === tag
                          ? activeTheme.chipActiveText
                          : activeTheme.chipText
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {collections.length > 0 ? (
            <label className="mt-4 block">
              <span
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: workspaceSoftText }}
              >
                Filter by collection
              </span>
              <select
                value={selectedCollectionFilter ?? ''}
                onChange={(event) => setSelectedCollectionFilter(event.target.value || null)}
                className="w-full rounded-2xl border px-3 py-3 text-sm"
                style={{
                  backgroundColor: workspaceSectionBg,
                  borderColor: workspacePanelBorder,
                  color: workspacePrimaryText
                }}
              >
                <option value="">All collections</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="mt-5 space-y-3">
            {objects.length === 0 ? (
              <div
                className="rounded-2xl px-4 py-4 text-sm"
                style={{ backgroundColor: workspaceSectionBg, color: workspaceMutedText }}
              >
                No object records yet. Start by creating the first one.
              </div>
            ) : filteredObjects.length === 0 ? (
              <div
                className="rounded-2xl px-4 py-4 text-sm"
                style={{ backgroundColor: workspaceSectionBg, color: workspaceMutedText }}
              >
                No objects match that title search.
              </div>
            ) : (
              filteredObjects.map((object) => {
                const isSelected = object.id === selectedId;

                return (
                  <div
                    key={object.id}
                    className="w-full rounded-2xl border px-4 py-4 transition"
                    style={{
                      borderColor: isSelected ? activeTheme.accent : workspacePanelBorder,
                      backgroundColor: isSelected ? workspaceSelectedCardBg : workspaceCardBg
                    }}
                  >
                    <Button
                      type="button"
                      onClick={() => handleSelect(object)}
                      variant="secondary"
                      className="w-full justify-start rounded-none border-0 bg-transparent p-0 text-left"
                    >
                      <div className="flex items-start gap-3">
                        {object.thumbnailPath ? (
                          <div
                            className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border"
                            style={{ borderColor: workspacePanelBorder, backgroundColor: activeTheme.badgeBg }}
                          >
                            <img
                              src={getThumbnailUrl(object.thumbnailPath) ?? ''}
                              alt={`Thumbnail for ${object.title}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed text-[10px] font-semibold uppercase tracking-[0.12em]"
                            style={{
                              borderColor: workspacePanelBorder,
                              backgroundColor: activeTheme.badgeBg,
                              color: workspaceSoftText
                            }}
                          >
                            <ImageIcon size={16} strokeWidth={2} />
                            <span className="mt-1">No image</span>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold" style={{ color: workspacePrimaryText }}>{object.title}</p>
                              <p className="mt-1 text-sm" style={{ color: workspaceMutedText }}>
                                {object.description ?? 'No description yet'}
                              </p>
                              {object.collection ? (
                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: activeTheme.accent }}>
                                  Collection: {object.collection.title}
                                </p>
                              ) : null}
                              {object.tags.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {object.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                                      style={{
                                        backgroundColor: activeTheme.badgeBg,
                                        color: activeTheme.badgeText
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <span
                              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                              style={{
                                backgroundColor: activeTheme.badgeBg,
                                color: activeTheme.badgeText
                              }}
                            >
                              {isSelected ? 'Open' : 'View'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>

                    <div
                      className="mt-4 flex items-center justify-between gap-3 border-t pt-3"
                      style={{ borderColor: workspacePanelBorder }}
                    >
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.16em]"
                          style={{ color: workspaceSoftText }}
                        >
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
            className="rounded-soft border p-5 sm:p-6"
            style={{ backgroundColor: workspacePanelBg, borderColor: workspacePanelBorder }}
          >
            {selectedObject ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: activeTheme.accent }}
                    >
                      Object details
                    </p>
                    <h2
                      className="mt-1 font-[family-name:var(--font-display)] text-3xl"
                      style={{ color: workspacePrimaryText }}
                    >
                      {selectedObject.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6" style={{ color: workspaceMutedText }}>
                      Review the object summary here, then use edit when you want to change the
                      core fields.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" variant="secondary" size="lg" disabled>
                      <ExternalLink size={16} strokeWidth={2.1} />
                      Public page unavailable
                    </Button>

                    <Button type="button" variant="secondary" size="lg" disabled>
                      <QrCode size={16} strokeWidth={2.1} />
                      QR unavailable
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
                  <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: workspaceSectionBg }}>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ color: activeTheme.badgeText }}
                    >
                      Description
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: workspaceMutedText }}>
                      {selectedObject.description ?? 'No description yet.'}
                    </p>
                  </div>

                  <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: workspaceSectionBg }}>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ color: activeTheme.badgeText }}
                    >
                      Story
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7" style={{ color: workspaceMutedText }}>
                      {selectedObject.story ?? 'No story has been added yet.'}
                    </p>
                  </div>

                  <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: workspaceSectionBg }}>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ color: activeTheme.badgeText }}
                    >
                      Collection
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: workspaceMutedText }}>
                      {selectedObject.collection ? selectedObject.collection.title : 'No collection assigned.'}
                    </p>
                  </div>

                  <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: workspaceSectionBg }}>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ color: activeTheme.badgeText }}
                    >
                      Tags
                    </p>
                    {selectedObject.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedObject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                            style={{ backgroundColor: activeTheme.badgeBg, color: workspacePrimaryText }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-6" style={{ color: workspaceMutedText }}>No tags yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : null}

            {!selectedObject ? (
              <>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: activeTheme.accent }}
                >
                  Object details
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl" style={{ color: workspacePrimaryText }}>
                  Select an object from the listing
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: workspaceMutedText }}>
                  Use the object listing to open an existing record, or create a new one from the
                  listing panel.
                </p>
              </>
            ) : null}

            <div className="mt-8 border-t pt-6" style={{ borderColor: workspacePanelBorder }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: activeTheme.badgeText }}
                  >
                    Attachments
                  </p>
                  <p className="mt-1 text-sm" style={{ color: workspaceMutedText }}>
                    {selectedObject
                      ? 'Attachments are not available in local-session mode yet. Export the session file to preserve object metadata.'
                      : 'Create an object first. Attachments will stay unavailable in local-session mode.'}
                  </p>
                </div>

                <label
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    'cursor-not-allowed bg-sand text-ink/55'
                  }`}
                >
                  <Upload size={16} strokeWidth={2.1} />
                  Add file
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    disabled
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4 space-y-3">
                {isLoadingMedia ? (
                  <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: workspaceSectionBg, color: workspaceMutedText }}>
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
                  <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: workspaceSectionBg, color: workspaceMutedText }}>
                    Select or create an object to manage attachments.
                  </div>
                ) : mediaItems.length === 0 && !isLoadingMedia ? (
                  <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: workspaceSectionBg, color: workspaceMutedText }}>
                    Attachments are unavailable in local-session mode. This object currently stores metadata only.
                  </div>
                ) : (
                  mediaItems.map((mediaItem) => (
                    <div
                      key={mediaItem.id}
                      className="rounded-2xl border px-4 py-4 text-sm"
                      style={{
                        borderColor: workspacePanelBorder,
                        backgroundColor: workspaceSectionBg,
                        color: workspacePrimaryText
                      }}
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
          <Dialog.Popup
            className="fixed left-1/2 top-1/2 z-30 flex max-h-[calc(100dvh-3rem)] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-soft border p-5 shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-6"
            style={{
              backgroundColor: modalBg,
              borderColor: workspacePanelBorder,
              color: modalFieldText
            }}
          >
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: activeTheme.accent }}
                >
                  Create object
                </p>
                <Dialog.Title
                  className="mt-1 font-[family-name:var(--font-display)] text-3xl"
                  style={{ color: modalFieldText }}
                >
                  New object record
                </Dialog.Title>
                <Dialog.Description
                  className="mt-2 text-sm leading-6"
                  style={{ color: workspaceMutedText }}
                >
                  Start with the essentials. The record will be saved into this local session on
                  this browser.
                </Dialog.Description>
              </div>

              <Dialog.Close
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: workspacePanelBorder, color: modalFieldText }}
              >
                <X size={16} strokeWidth={2.1} />
                Close
              </Dialog.Close>
            </div>

            <form className="mt-6 min-h-0 space-y-4 overflow-y-auto pr-2" onSubmit={handleCreateSubmit}>
              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Title</span>
                  <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                  style={{
                    backgroundColor: modalFieldBg,
                    borderColor: workspacePanelBorder,
                    color: modalFieldText
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                  Up to {fieldLimits.title} characters.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Tags</span>
                  <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                  style={{
                    backgroundColor: modalFieldBg,
                    borderColor: workspacePanelBorder,
                    color: modalFieldText
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                  Comma-separated tags, up to {fieldLimits.tagsPerObject} tags and {fieldLimits.tag}{' '}
                  characters each.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold" style={{ color: modalFieldText }}>
                  Collection
                </span>
                <select
                  value={createFormState.collectionId}
                  onChange={(event) =>
                    setCreateFormState((current) => ({
                      ...current,
                      collectionId: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border px-3 py-3 text-sm"
                  style={{
                    backgroundColor: modalFieldBg,
                    borderColor: workspacePanelBorder,
                    color: modalFieldText
                  }}
                >
                  <option value="">No collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                  Optional. Assign this object to a local collection grouping in this workspace.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Description</span>
                  <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                  style={{
                    backgroundColor: modalFieldBg,
                    borderColor: workspacePanelBorder,
                    color: modalFieldText
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                  Up to {fieldLimits.description} characters.
                </p>
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Story</span>
                  <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                  style={{
                    backgroundColor: modalFieldBg,
                    borderColor: workspacePanelBorder,
                    color: modalFieldText
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
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
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"
                  style={{ borderColor: workspacePanelBorder, color: modalFieldText }}
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
          <Dialog.Popup
            className="fixed left-1/2 top-1/2 z-30 flex max-h-[calc(100dvh-3rem)] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-soft border p-5 shadow-xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-6"
            style={{
              backgroundColor: modalBg,
              borderColor: workspacePanelBorder,
              color: modalFieldText
            }}
          >
            {editingObject ? (
              <>
                <div className="flex shrink-0 items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: activeTheme.accent }}
                    >
                      Edit object
                    </p>
                    <Dialog.Title
                      className="mt-1 font-[family-name:var(--font-display)] text-3xl"
                      style={{ color: modalFieldText }}
                    >
                      {editingObject.title}
                    </Dialog.Title>
                    <Dialog.Description
                      className="mt-2 text-sm leading-6"
                      style={{ color: workspaceMutedText }}
                    >
                      Update the core information here. Changes are saved into this local session
                      on this browser.
                    </Dialog.Description>
                  </div>

                  <Dialog.Close
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: workspacePanelBorder, color: modalFieldText }}
                  >
                    <X size={16} strokeWidth={2.1} />
                    Close
                  </Dialog.Close>
                </div>

                <form className="mt-6 min-h-0 space-y-4 overflow-y-auto pr-2" onSubmit={handleEditSubmit}>
                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Title</span>
                      <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                      style={{
                        backgroundColor: modalFieldBg,
                        borderColor: workspacePanelBorder,
                        color: modalFieldText
                      }}
                    />
                    <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                      Up to {fieldLimits.title} characters.
                    </p>
                  </label>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Tags</span>
                      <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                      style={{
                        backgroundColor: modalFieldBg,
                        borderColor: workspacePanelBorder,
                        color: modalFieldText
                      }}
                    />
                    <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                      Comma-separated tags, up to {fieldLimits.tagsPerObject} tags and {fieldLimits.tag}{' '}
                      characters each.
                    </p>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold" style={{ color: modalFieldText }}>
                      Collection
                    </span>
                    <select
                      value={editFormState.collectionId}
                      onChange={(event) =>
                        setEditFormState((current) => ({
                          ...current,
                          collectionId: event.target.value
                        }))
                      }
                      className="w-full rounded-2xl border px-3 py-3 text-sm"
                      style={{
                        backgroundColor: modalFieldBg,
                        borderColor: workspacePanelBorder,
                        color: modalFieldText
                      }}
                    >
                      <option value="">No collection</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                      Optional. Clear this field to remove the object from its collection.
                    </p>
                  </label>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Description</span>
                      <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                      style={{
                        backgroundColor: modalFieldBg,
                        borderColor: workspacePanelBorder,
                        color: modalFieldText
                      }}
                    />
                    <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
                      Up to {fieldLimits.description} characters.
                    </p>
                  </label>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold" style={{ color: modalFieldText }}>Story</span>
                      <span className="text-xs font-medium" style={{ color: modalHelperText }}>
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
                      style={{
                        backgroundColor: modalFieldBg,
                        borderColor: workspacePanelBorder,
                        color: modalFieldText
                      }}
                    />
                    <p className="mt-2 text-xs" style={{ color: modalHelperText }}>
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
                        className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"
                        style={{ borderColor: workspacePanelBorder, color: modalFieldText }}
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
