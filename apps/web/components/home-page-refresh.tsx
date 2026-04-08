'use client';

import {
  ArrowUpRight,
  BarChart3,
  LayoutDashboard,
  Package2,
  QrCode,
  Sparkles
} from 'lucide-react';
import type { ObjectRecord } from '@object-atlas/types';

import { ObjectWorkspace } from './object-workspace';
import { ThemeSelector } from './theme-selector';
import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { WorkspaceNavbar } from './workspace-navbar';
import { Button } from './ui/button';

function formatCount(value: number): string {
  return value.toString().padStart(2, '0');
}

export function HomePageRefresh({
  initialObjects
}: {
  initialObjects: ObjectRecord[];
}) {
  const { mode, themeKey } = useTheme();
  const isDark = mode === 'dark';
  const activeTheme = themeStyles[themeKey];

  const objectsWithPublicPages = initialObjects.filter((item) => item.publicId).length;
  const objectsWithMedia = initialObjects.filter((item) => item.thumbnailPath).length;
  const taggedObjects = initialObjects.filter((item) => item.tags.length > 0).length;

  const overviewStats = [
    { label: 'Objects', value: formatCount(initialObjects.length) },
    { label: 'Public pages', value: formatCount(objectsWithPublicPages) },
    { label: 'With media', value: formatCount(objectsWithMedia) },
    { label: 'Tagged', value: formatCount(taggedObjects) }
  ];

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <WorkspaceNavbar />

        <section
          className={`overflow-hidden rounded-[2rem] border ${
            isDark ? activeTheme.shellPanel.dark : activeTheme.shellPanel.light
          }`}
        >
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: activeTheme.accent }}
                >
                  ObjectAtlas
                </p>
                <p className="mt-2 text-sm text-white/66">
                  Object records, public pages, and QR-linked access in one calmer workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" className="border-white/10 bg-white/5 text-white">
                  <LayoutDashboard size={16} strokeWidth={2.1} />
                  Overview
                </Button>
                <Button variant="ghost" className="border-white/10 bg-white/5 text-white">
                  <Package2 size={16} strokeWidth={2.1} />
                  Objects
                </Button>
              </div>
            </div>

            <ThemeSelector compact />

            <div className="grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
              <div
                className="rounded-[1.75rem] px-5 py-6 text-[#17181d] sm:px-6"
                style={{ backgroundColor: activeTheme.heroSurface }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: activeTheme.accent }}
                >
                  Collection shell
                </p>
                <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
                  Give each object a public identity with a cleaner working surface.
                </h1>
                <p
                  className="mt-4 max-w-2xl text-sm leading-7 sm:text-base"
                  style={{ color: activeTheme.cardMetaText }}
                >
                  Manage records, attach media, choose a main image, and publish QR-linked object
                  pages from a layout that feels more intentional than the original MVP shell.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/#object-listing" variant="primary" size="lg">
                    Open object listing
                    <ArrowUpRight size={16} strokeWidth={2.1} />
                  </Button>
                  <Button href="/config" variant="secondary" size="lg" className="bg-white">
                    Theme settings
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                <div
                  className="rounded-[1.75rem] border border-white/10 px-5 py-5"
                  style={{ backgroundColor: activeTheme.metricsPanel }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: activeTheme.accent }}
                  >
                    Workspace snapshot
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {overviewStats.map((item) => (
                      <div key={item.label} className="rounded-[1.25rem] bg-white/6 px-3 py-4">
                        <p className="text-xl font-semibold text-white">{item.value}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/56">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[1.75rem] border border-white/10 px-5 py-5 text-white"
                  style={{ backgroundColor: activeTheme.previewPanel }}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} strokeWidth={2.1} style={{ color: activeTheme.accent }} />
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: activeTheme.accent }}
                    >
                      Public-facing flow
                    </p>
                  </div>
                  <div className="mt-4 rounded-[1.25rem] bg-white/6 p-4">
                    <div className="aspect-[4/3] rounded-[1rem] bg-[linear-gradient(135deg,#d9b48a,transparent),#2a313d]" />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">QR-linked object page</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/54">
                          Story, images, and object context
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="border-[#e5c49f] bg-[#ecd1ad] text-[#53321d] hover:bg-[#f1d8b7]"
                      >
                        <QrCode size={16} strokeWidth={2.1} />
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                  Live workspace
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                  The real object management flow, inside the new shell.
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: activeTheme.cardMetaText }}>
                  This keeps the working MVP behavior in place while the top-level visual direction
                  moves toward the refreshed layout.
                </p>
              </div>

              <Button variant="soft">
                <Sparkles size={16} strokeWidth={2.1} />
                Current MVP
              </Button>
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
