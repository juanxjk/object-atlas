'use client';

import type { PublicObjectRecord } from '@object-atlas/types';

import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { ThemeModeToggle } from './theme-mode-toggle';
import { ThemeNavSelect } from './theme-nav-select';
import { PublicMediaCarousel } from './public-media-carousel';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium'
  }).format(new Date(value));
}

function MediaList({ media }: { media: PublicObjectRecord['media'] }) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';
  const documentMedia = media.filter((item) => !item.mimeType.startsWith('image/'));

  if (documentMedia.length === 0) {
    return (
      <div
        className="rounded-2xl px-4 py-4 text-sm"
        style={{
          backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted,
          color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText
        }}
      >
        No documents have been attached to this object yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documentMedia.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border px-4 py-4 text-sm"
          style={{
            backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.badgeBg,
            borderColor: activeTheme.cardBorder,
            color: isDark ? '#f7f3ee' : '#17181d'
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{item.originalFilename}</p>
              <p
                className="mt-1 text-xs uppercase tracking-[0.16em]"
                style={{ color: isDark ? 'rgba(255,255,255,0.58)' : activeTheme.cardMetaText }}
              >
                {item.mimeType}
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{
                backgroundColor: activeTheme.chipBg,
                color: activeTheme.chipText
              }}
            >
              {(item.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PublicObjectPage({ object }: { object: PublicObjectRecord }) {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';
  const panelBg = isDark ? activeTheme.heroPanel : activeTheme.badgeBg;
  const sectionBg = isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary;
  const subpanelBg = isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted;
  const primaryText = isDark ? '#f7f3ee' : '#17181d';
  const mutedText = isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText;

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex justify-end gap-2">
          <ThemeModeToggle />
          <ThemeNavSelect />
        </div>

        <section
          className="rounded-soft border p-6 sm:p-8"
          style={{ backgroundColor: panelBg, borderColor: activeTheme.cardBorder }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: activeTheme.accent }}
          >
            Public object page
          </p>
          <h1
            className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl"
            style={{ color: primaryText }}
          >
            {object.title}
          </h1>
          <p className="mt-3 text-base leading-7" style={{ color: mutedText }}>
            {object.description ?? 'No public description has been added yet.'}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-2xl px-4 py-4 text-sm"
              style={{ backgroundColor: subpanelBg, color: primaryText }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: activeTheme.badgeText }}
              >
                Public identifier
              </p>
              <p className="mt-2 break-all">{object.publicId}</p>
            </div>

            <div
              className="rounded-2xl px-4 py-4 text-sm"
              style={{ backgroundColor: subpanelBg, color: primaryText }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: activeTheme.badgeText }}
              >
                Last updated
              </p>
              <p className="mt-2">{formatDate(object.updatedAt)}</p>
            </div>
          </div>

          {object.tags.length > 0 ? (
            <div className="mt-6">
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: activeTheme.badgeText }}
              >
                Tags
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {object.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{
                      backgroundColor: activeTheme.chipBg,
                      color: activeTheme.chipText
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section
          className="rounded-soft border p-6 sm:p-8"
          style={{ backgroundColor: sectionBg, borderColor: activeTheme.cardBorder }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: activeTheme.badgeText }}
          >
            Story
          </p>
          <div
            className="mt-4 rounded-2xl px-4 py-4 text-sm leading-7"
            style={{ backgroundColor: subpanelBg, color: mutedText }}
          >
            {object.story ?? 'A story for this object has not been published yet.'}
          </div>
        </section>

        <section
          className="rounded-soft border p-6 sm:p-8"
          style={{ backgroundColor: sectionBg, borderColor: activeTheme.cardBorder }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: activeTheme.badgeText }}
          >
            Media
          </p>
          <div className="mt-4">
            <PublicMediaCarousel media={object.media} />
          </div>
          <div className="mt-6">
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: isDark ? 'rgba(255,255,255,0.48)' : activeTheme.cardMetaText }}
            >
              Documents and other files
            </p>
          </div>
          <div className="mt-3">
            <MediaList media={object.media} />
          </div>
        </section>
      </div>
    </main>
  );
}
