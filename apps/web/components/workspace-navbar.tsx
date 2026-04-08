'use client';

import { BookOpen, Menu, Package2, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { ThemeNavSelect } from './theme-nav-select';
import { Button } from './ui/button';

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
  },
  {
    href: '/config',
    label: 'Config',
    icon: Settings2
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

          <Button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            variant="ghost"
            className="lg:hidden"
          >
            <Menu size={16} strokeWidth={2.2} />
            Menu
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeNavSelect />
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                href={item.href}
                variant="ghost"
              >
                <item.icon size={16} strokeWidth={2.1} />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 space-y-2 rounded-3xl border border-sand bg-clay p-3 lg:hidden">
            <div className="rounded-2xl bg-white/70 p-2">
              <ThemeNavSelect />
            </div>
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                variant="secondary"
                className="w-full justify-start rounded-2xl"
              >
                <item.icon size={16} strokeWidth={2.1} />
                {item.label}
              </Button>
            ))}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
