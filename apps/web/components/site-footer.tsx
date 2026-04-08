'use client';

import { FolderGit2, Home, Info } from 'lucide-react';

import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

const footerLinks = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/about',
    label: 'About',
    icon: Info
  }
];

const githubRepositoryUrl = 'https://github.com/juanxjk/object-atlas';

export function SiteFooter() {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: isDark ? activeTheme.heroPanel : activeTheme.cardPrimary,
        borderColor: activeTheme.cardBorder
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: activeTheme.badgeText }}
            >
              ObjectAtlas
            </p>
            <p
              className="mt-2 max-w-2xl text-sm leading-6"
              style={{ color: isDark ? 'rgba(255,255,255,0.72)' : activeTheme.cardMetaText }}
            >
              A calm home for object records, public stories, and QR-linked pages.
            </p>
            <Button
              href={githubRepositoryUrl}
              target="_blank"
              rel="noreferrer"
              variant="link"
              className="mt-3 px-0 py-0 font-medium"
              style={{ color: activeTheme.accent }}
            >
              <FolderGit2 size={16} strokeWidth={2.1} />
              View the GitHub repository
            </Button>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {footerLinks.map((link) => (
              <Button
                key={link.href}
                href={link.href}
                variant="secondary"
                style={{
                  backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.badgeBg,
                  borderColor: activeTheme.cardBorder,
                  color: isDark ? '#f7f3ee' : '#17181d'
                }}
              >
                <link.icon size={16} strokeWidth={2.1} />
                {link.label}
              </Button>
            ))}
          </nav>
        </div>

        <div
          className="border-t pt-4 text-xs uppercase tracking-[0.16em]"
          style={{
            borderColor: activeTheme.cardBorder,
            color: isDark ? 'rgba(255,255,255,0.48)' : activeTheme.badgeText
          }}
        >
          Physical objects, readable memory.
        </div>
      </div>
    </footer>
  );
}
