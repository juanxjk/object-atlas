'use client';

import { BookOpen, Menu, Package2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const navigationItems = [
  {
    href: '/#object-listing',
    label: 'Object listing',
    icon: Package2
  },
  {
    href: '/about',
    label: 'About',
    icon: BookOpen
  }
];

export function WorkspaceNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-20">
      <nav className="rounded-soft border border-black/5 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
              ObjectAtlas
            </p>
            <p className="mt-1 truncate text-sm text-ink/70">
              Browse records and learn more about the project.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-clay px-4 py-2 text-sm font-semibold text-ink lg:hidden"
          >
            <Menu size={16} strokeWidth={2.2} />
            Menu
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-sand bg-clay px-4 py-2 text-sm font-semibold text-ink"
              >
                <item.icon size={16} strokeWidth={2.1} />
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
                className="inline-flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink"
              >
                <item.icon size={16} strokeWidth={2.1} />
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
