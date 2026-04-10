'use client';

import { BookOpen, Home, Menu, Package2, PackageOpen, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { ThemeModeToggle } from './theme-mode-toggle';
import { ThemeNavSelect } from './theme-nav-select';
import { Button } from './ui/button';

const navigationItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/objects',
    label: 'Object listing',
    icon: Package2
  },
  {
    href: '/collections',
    label: 'Collections',
    icon: PackageOpen
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
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  return (
    <header className="sticky top-4 z-20">
      <nav
        className="rounded-soft border px-4 py-3 backdrop-blur sm:px-6"
        style={{
          backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary,
          borderColor: activeTheme.cardBorder,
          color: isDark ? '#f7f3ee' : '#17181d'
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: activeTheme.badgeText }}
            >
              ObjectAtlas
            </p>
            <p
              className="mt-1 truncate text-sm"
              style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}
            >
              Browse records and learn more about the project.
            </p>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                href={item.href}
                variant="ghost"
                style={{
                  color: isDark ? '#f7f3ee' : '#17181d',
                  borderColor: activeTheme.cardBorder,
                  backgroundColor: 'transparent'
                }}
              >
                <item.icon size={16} strokeWidth={2.1} />
                {item.label}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            variant="ghost"
            className="lg:hidden"
            style={{ color: isDark ? '#f7f3ee' : '#17181d' }}
          >
            <Menu size={16} strokeWidth={2.2} />
            Menu
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeModeToggle />
            <ThemeNavSelect />
          </div>
        </div>

        {isMenuOpen ? (
          <div
            className="mt-4 space-y-2 rounded-3xl border p-3 lg:hidden"
            style={{
              backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardMuted,
              borderColor: activeTheme.cardBorder
            }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl p-2"
              style={{
                backgroundColor: isDark ? activeTheme.heroPanel : activeTheme.badgeBg
              }}
            >
              <ThemeModeToggle />
              <ThemeNavSelect />
            </div>
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                variant="secondary"
                className="w-full justify-start rounded-2xl"
                style={{
                  backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary,
                  borderColor: activeTheme.cardBorder,
                  color: isDark ? '#f7f3ee' : '#17181d'
                }}
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
