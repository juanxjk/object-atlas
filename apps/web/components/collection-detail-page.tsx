'use client';

import { ExternalLink, PackageOpen, QrCode } from 'lucide-react';
import { Dialog } from '@base-ui/react/dialog';
import { useState } from 'react';
import type { CollectionWithObjectsRecord } from '@object-atlas/types';

import { ObjectQrCard } from './object-qr-card';
import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { WorkspaceNavbar } from './workspace-navbar';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function getThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath) {
    return null;
  }

  return `${apiBaseUrl}/uploads/${thumbnailPath}`;
}

function getPublicCollectionUrl(publicId: string): string {
  return `${publicAppUrl}/collections/public/${publicId}`;
}

function visibilityLabel(visibility: CollectionWithObjectsRecord['visibility']): string {
  if (visibility === 'private') return 'Private';
  if (visibility === 'unlisted') return 'Unlisted';
  return 'Public';
}

export function CollectionDetailPage({ collection }: { collection: CollectionWithObjectsRecord }) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';
  const [isQrOpen, setIsQrOpen] = useState(false);
  const canShare = collection.visibility !== 'private';

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.accent }}>
            Internal collection page
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ backgroundColor: activeTheme.badgeBg, color: activeTheme.badgeText }}>
                <PackageOpen size={14} strokeWidth={2.1} />
                {visibilityLabel(collection.visibility)}
              </div>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                {collection.title}
              </h1>
              <p className="mt-3 text-base leading-7" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}>
                {collection.description ?? 'No collection description has been added yet.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {canShare ? (
                <>
                  <Button href={getPublicCollectionUrl(collection.publicId)} target="_blank" rel="noreferrer" variant="secondary" size="lg">
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.badgeText }}>
                Assigned objects
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                {collection.objectCount} objects in this collection
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collection.objects.length === 0 ? (
              <div className="rounded-3xl border px-5 py-5 text-sm" style={{ backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted, borderColor: activeTheme.cardBorder, color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}>
                This collection is empty right now. Assign objects from the object workspace to make
                this page useful.
              </div>
            ) : (
              collection.objects.map((object) => (
                <article key={object.id} className="rounded-3xl border p-5" style={{ backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.badgeBg, borderColor: activeTheme.cardBorder }}>
                  {object.thumbnailPath ? (
                    <img src={getThumbnailUrl(object.thumbnailPath) ?? ''} alt={object.title} className="h-48 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed text-sm" style={{ borderColor: activeTheme.cardBorder, color: isDark ? 'rgba(255,255,255,0.58)' : activeTheme.cardMetaText }}>
                      No image
                    </div>
                  )}
                  <h3 className="mt-4 text-xl font-semibold" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                    {object.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}>
                    {object.description ?? 'No description yet.'}
                  </p>
                  <div className="mt-4">
                    <Button href={`/objects?collectionId=${collection.id}`} variant="secondary">
                      View in object workspace
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <Dialog.Root open={isQrOpen} onOpenChange={setIsQrOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-30 bg-ink/35" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-30 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-soft">
            <ObjectQrCard
              title={collection.title}
              publicUrl={getPublicCollectionUrl(collection.publicId)}
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
