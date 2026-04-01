'use client';

import Link from 'next/link';
import { useState } from 'react';

const navigationItems = [
  {
    href: '#object-listing',
    label: 'Object listing'
  },
  {
    href: '#object-editor',
    label: 'Create object'
  }
];

export function WorkspaceNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-20">
      <nav className="rounded-soft border border-black/5 bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
              Workspace navigation
            </p>
            <p className="mt-1 truncate text-sm text-ink/70">
              Jump between object listing and editor from a persistent top bar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-clay px-4 py-2 text-sm font-semibold text-ink lg:hidden"
          >
            <span className="text-base leading-none">≡</span>
            Menu
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-sand bg-clay px-4 py-2 text-sm font-semibold text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 space-y-2 rounded-3xl border border-sand bg-clay p-3 lg:hidden">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
