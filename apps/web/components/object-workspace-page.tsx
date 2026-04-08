'use client';

import type { ObjectRecord } from '@object-atlas/types';

import { ObjectWorkspace } from './object-workspace';
import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { WorkspaceNavbar } from './workspace-navbar';

export function ObjectWorkspacePage({
  initialObjects
}: {
  initialObjects: ObjectRecord[];
}) {
  const { mode, themeKey } = useTheme();
  const isDark = mode === 'dark';
  const activeTheme = themeStyles[themeKey];

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <WorkspaceNavbar />

        <section
          className={`rounded-[2rem] border p-3 sm:p-4 ${
            isDark ? activeTheme.surface.dark : activeTheme.surface.light
          }`}
        >
          <div
            className="rounded-[1.5rem] px-4 py-4 text-[#17181d] sm:px-5"
            style={{ backgroundColor: activeTheme.listingPanel }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: activeTheme.badgeText }}
                >
                  Object workspace
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                  Manage the collection in its own dedicated view.
                </h1>
                <p className="mt-2 text-sm leading-6" style={{ color: activeTheme.cardMetaText }}>
                  Create and update records, manage media, and move through the collection from a
                  calmer, more structured workspace.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <ObjectWorkspace initialObjects={initialObjects} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
