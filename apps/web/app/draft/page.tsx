import {
  ArrowUpRight,
  LayoutDashboard,
  Moon,
  Package2,
  QrCode,
  Search,
  Sparkles,
  SunMedium
} from 'lucide-react';

import { Button } from '../../components/ui/button';
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

export default function DraftPage() {
  return (
    <main className="min-h-screen bg-[#efe6d9] px-4 py-6 text-[#17181d] sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-black/6 bg-[#12141a] text-white">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b48a]">
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
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-0 bg-white text-[#17181d] hover:bg-white"
                  >
                    <SunMedium size={15} strokeWidth={2.1} />
                    Light
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-0 bg-transparent text-white hover:bg-white/8"
                  >
                    <Moon size={15} strokeWidth={2.1} />
                    Dark
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.85fr]">
              <div className="rounded-[1.75rem] bg-[#f4ede3] px-5 py-6 text-[#17181d] sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b05d33]">
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
                <div className="rounded-[1.75rem] border border-white/10 bg-[#1b202a] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b48a]">
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

                <div className="rounded-[1.75rem] border border-white/10 bg-[#262c38] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b48a]">
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
          <article className="rounded-[2rem] border border-black/6 bg-[#f7f0e7] p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[1.5rem] bg-white px-4 py-4">
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

              <div className="rounded-[1.5rem] bg-[#15181f] px-4 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b48a]">
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
                    <Button variant="ghost" className="border-white/10 bg-white/6 text-white">
                      <QrCode size={16} strokeWidth={2.1} />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-black/6 bg-white p-4 sm:p-5">
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
