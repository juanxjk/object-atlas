'use client';

import { ExternalLink } from 'lucide-react';
import type { PublicCollectionRecord } from '@object-atlas/types';

import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { ThemeModeToggle } from './theme-mode-toggle';
import { ThemeNavSelect } from './theme-nav-select';
import { Button } from './ui/button';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getThumbnailUrl(thumbnailPath: string | null): string | null {
  if (!thumbnailPath) {
    return null;
  }

  return `${apiBaseUrl}/uploads/${thumbnailPath}`;
}

export function PublicCollectionPage({ collection }: { collection: PublicCollectionRecord }) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex justify-end gap-2">
          <ThemeModeToggle />
          <ThemeNavSelect />
        </div>

        <section className="rounded-soft border p-6 sm:p-8" style={{ backgroundColor: isDark ? activeTheme.heroPanel : activeTheme.badgeBg, borderColor: activeTheme.cardBorder }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.accent }}>
            Public collection page
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl sm:text-5xl" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
            {collection.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}>
            {collection.description ?? 'No public collection description has been added yet.'}
          </p>
        </section>

        <section className="rounded-soft border p-6 sm:p-8" style={{ backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary, borderColor: activeTheme.cardBorder }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: activeTheme.badgeText }}>
            Included objects
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collection.objects.length === 0 ? (
              <div className="rounded-3xl border px-5 py-5 text-sm" style={{ backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted, borderColor: activeTheme.cardBorder, color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}>
                This collection does not have public objects available yet.
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
                  <h2 className="mt-4 text-2xl font-semibold" style={{ color: isDark ? '#f7f3ee' : '#17181d' }}>
                    {object.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}>
                    {object.description ?? 'No public description yet.'}
                  </p>
                  <div className="mt-4">
                    <Button href={`/objects/${object.publicId}`} variant="secondary">
                      <ExternalLink size={16} strokeWidth={2.1} />
                      Open object page
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
