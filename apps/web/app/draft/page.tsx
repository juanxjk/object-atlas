'use client';

import {
  ArrowUpRight,
  LayoutDashboard,
  Package2,
  QrCode,
  Search,
  Sparkles,
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { ThemeSelector } from '../../components/theme-selector';
import { type ThemeKey, useTheme } from '../../components/theme-provider';
import { Input } from '../../components/ui/input';

const collectionCards = [
  {
    title: 'Bronze lamp',
    meta: 'Accession 02.014',
    note: 'Public page ready'
  },
  {
    title: 'Ceramic bowl',
    meta: 'Awaiting story draft',
    note: 'Media attached'
  },
  {
    title: 'Wood carving',
    meta: 'No QR printed yet',
    note: 'Needs review'
  }
];

const quickStats = [
  { label: 'Public pages', value: '24' },
  { label: 'Objects online', value: '86' },
  { label: 'Pending edits', value: '07' }
];

const tags = ['Bronze', 'Ceramic', 'Colonial', 'Portrait', 'Restoration'];

const draftThemeClasses: Record<
  ThemeKey,
  {
    accent: string;
    heroPanel: string;
    heroSurface: string;
    listingPanel: string;
    mainBg: {
      dark: string;
      light: string;
    };
    metricsPanel: string;
    previewPanel: string;
    secondaryPanel: string;
    shellPanel: {
      dark: string;
      light: string;
    };
    surface: {
      dark: string;
      light: string;
    };
  }
> = {
  atlas: {
    accent: '#d9b48a',
    heroPanel: '#0f1218',
    heroSurface: '#f0e5d6',
    listingPanel: '#f4ede3',
    mainBg: {
      light: 'bg-[#efe6d9] text-[#17181d]',
      dark: 'bg-[#14181f] text-[#f5eee6]'
    },
    metricsPanel: '#171c24',
    previewPanel: '#10141b',
    secondaryPanel: '#222834',
    shellPanel: {
      light: 'border-black/6 bg-[#12141a] text-white',
      dark: 'border-white/8 bg-[#0f1218] text-white'
    },
    surface: {
      light: 'border-black/6 bg-[#f7f0e7]',
      dark: 'border-white/8 bg-[#1b2028]'
    }
  },
  gallery: {
    accent: '#a8c2ac',
    heroPanel: '#102019',
    heroSurface: '#e6eee5',
    listingPanel: '#edf3ec',
    mainBg: {
      light: 'bg-[#e8efe7] text-[#172019]',
      dark: 'bg-[#111b16] text-[#edf4ee]'
    },
    metricsPanel: '#163026',
    previewPanel: '#13251d',
    secondaryPanel: '#244235',
    shellPanel: {
      light: 'border-black/6 bg-[#102019] text-white',
      dark: 'border-white/8 bg-[#0d1813] text-white'
    },
    surface: {
      light: 'border-black/6 bg-[#eef4ea]',
      dark: 'border-white/8 bg-[#18241e]'
    }
  },
  nocturne: {
    accent: '#9caee6',
    heroPanel: '#111421',
    heroSurface: '#e6e9f4',
    listingPanel: '#eceff8',
    mainBg: {
      light: 'bg-[#e8ebf5] text-[#171b27]',
      dark: 'bg-[#111420] text-[#eef1fb]'
    },
    metricsPanel: '#1a1f33',
    previewPanel: '#151a2c',
    secondaryPanel: '#252c46',
    shellPanel: {
      light: 'border-black/6 bg-[#111421] text-white',
      dark: 'border-white/8 bg-[#0d1019] text-white'
    },
    surface: {
      light: 'border-black/6 bg-[#eef1fa]',
      dark: 'border-white/8 bg-[#191e31]'
    }
  },
  dreamland: {
    accent: '#ffafcc',
    heroPanel: '#6e5a84',
    heroSurface: '#ffc8dd',
    listingPanel: '#bde0fe',
    mainBg: {
      light: 'bg-[#fff3f8] text-[#352a45]',
      dark: 'bg-[#2f2540] text-[#fdf3fa]'
    },
    metricsPanel: '#8d74aa',
    previewPanel: '#5f4d7c',
    secondaryPanel: '#7a68a0',
    shellPanel: {
      light: 'border-[#ffafcc]/30 bg-[#6e5a84] text-white',
      dark: 'border-[#ffc8dd]/18 bg-[#4f4068] text-white'
    },
    surface: {
      light: 'border-[#ffafcc]/28 bg-[#ffeaf3]',
      dark: 'border-[#ffc8dd]/18 bg-[#43365a]'
    }
  }
};

export default function DraftPage() {
  const { mode, themeKey } = useTheme();
  const isDark = mode === 'dark';
  const activeTheme = draftThemeClasses[themeKey];

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
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
                  ObjectAtlas Draft
                </p>
                <p className="mt-2 text-sm text-white/66">
                  A layout study for the next UI direction.
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

            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.85fr]">
              <div
                className={`rounded-[1.75rem] px-5 py-6 sm:px-6 ${
                  isDark
                    ? `text-[#17181d]`
                    : `text-[#17181d]`
                }`}
                style={{ backgroundColor: activeTheme.heroSurface }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: activeTheme.accent }}
                >
                  Bento layout draft
                </p>
                <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
                  Cleaner blocks, stronger hierarchy, calmer surfaces.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-black/68 sm:text-base">
                  This page is a non-functional design study for a future ObjectAtlas interface:
                  solid surfaces, tighter composition, stronger contrast, and a layout system that
                  feels more product-like than MVP-like.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="primary" size="lg">
                    Explore direction
                    <ArrowUpRight size={16} strokeWidth={2.1} />
                  </Button>
                  <Button variant="secondary" size="lg" className="bg-white">
                    Compare shell
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
                    Quick metrics
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {quickStats.map((item) => (
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
                  className="rounded-[1.75rem] border border-white/10 px-5 py-5"
                  style={{ backgroundColor: activeTheme.secondaryPanel }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: activeTheme.accent }}
                  >
                    Visual tone
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Less dashboard chrome, fewer repeated panels, more deliberate grouping and
                    stronger section contrast.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.95fr]">
          <article
            className={`rounded-[2rem] border p-4 sm:p-5 ${
              isDark ? activeTheme.surface.dark : activeTheme.surface.light
            }`}
          >
            <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
              <div
                className="rounded-[1.5rem] bg-white px-4 py-4 text-[#17181d]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d6c57]">
                      Listing shell
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                      Draft object browser
                    </h2>
                  </div>
                  <Button variant="soft">
                    <Sparkles size={16} strokeWidth={2.1} />
                    New item
                  </Button>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-black/6 bg-[#f4ede3] p-3">
                  <div className="flex items-center gap-2">
                    <Search size={15} strokeWidth={2.1} className="text-black/48" />
                    <Input
                      readOnly
                      value="Search titles, tags, and materials"
                      className="border-0 bg-transparent px-0 py-0 text-sm text-black/58"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Button
                      key={tag}
                      variant={index === 0 ? 'chip-active' : 'chip'}
                      size="sm"
                      className="text-xs uppercase tracking-[0.12em]"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[1.5rem] px-4 py-4 text-white"
                style={{ backgroundColor: activeTheme.previewPanel }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: activeTheme.accent }}
                >
                  Public preview
                </p>
                <div className="mt-4 rounded-[1.25rem] bg-white/6 p-4">
                  <div className="aspect-[4/3] rounded-[1rem] bg-[linear-gradient(135deg,#d9b48a,transparent),#2a313d]" />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">QR-linked object page</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/54">
                        Read story, images, notes
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

            <div
              className="mt-4 rounded-[1.5rem] bg-white px-4 py-4 text-[#17181d]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d6c57]">
                    Media example
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[#17181d]">
                    Object with multiple attached images
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/62">
                    A draft detail surface for an item with several attached images: one lead image,
                    a compact gallery strip, and quick actions grouped without looking crowded.
                  </p>
                </div>

                <Button variant="secondary" className="bg-[#f4ede3]">
                  View all media
                </Button>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="overflow-hidden rounded-[1.4rem] border border-black/6 bg-[#efe2cf]">
                  <div className="aspect-[4/3] bg-[linear-gradient(135deg,#b36a41,#f0dcc0_48%,#d8b48d)]" />
                  <div className="flex items-center justify-between gap-3 border-t border-black/6 bg-[#fffaf3] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#17181d]">Main attached image</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-black/46">
                        Hero photo for public page and listing
                      </p>
                    </div>
                    <Button variant="ghost" className="bg-white">
                      Set as main
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="overflow-hidden rounded-[1.25rem] border border-black/6 bg-[#f5eee3]"
                    >
                      <div
                        className={`aspect-square ${
                          item === 1
                            ? 'bg-[linear-gradient(140deg,#d1a377,#f2dfc9)]'
                            : item === 2
                              ? 'bg-[linear-gradient(140deg,#6f7d6a,#dce3d7)]'
                              : item === 3
                                ? 'bg-[linear-gradient(140deg,#9d6b54,#ead3c3)]'
                                : 'bg-[linear-gradient(140deg,#8c8f9a,#dadde4)]'
                        }`}
                      />
                      <div className="flex flex-col items-start gap-3 px-3 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#17181d]">Image {item}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-black/42">
                            Attached
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center bg-white"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside
            className={`rounded-[2rem] border p-4 sm:p-5 ${
              isDark ? activeTheme.surface.dark : 'border-black/6 bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d6c57]">
                  Record cards
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[#17181d]">
                  A calmer object list
                </h2>
              </div>
              <Button variant="secondary" className="bg-[#f4ede3]">
                Show all
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {collectionCards.map((card, index) => (
                <div
                  key={card.title}
                  className={`rounded-[1.5rem] border px-4 py-4 ${
                    index === 0
                      ? 'border-[#d4b08c] bg-[#fff8ef]'
                      : 'border-black/6 bg-[#f7f1e9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-[1.1rem] bg-[linear-gradient(140deg,#d2aa82,#ede1d1)]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#17181d]">{card.title}</p>
                          <p className="mt-1 text-sm text-black/58">{card.meta}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4d6c57]">
                          {card.note}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" className="bg-white">
                          Open
                        </Button>
                        <Button variant="secondary" size="sm" className="bg-white">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="bg-[#ede4d7]">
                          QR
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
