'use client';

import { Moon, SunMedium } from 'lucide-react';

import { themeStyles } from './theme-styles';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

export function ThemeModeToggle() {
  const { mode, setMode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border p-1"
      style={{
        backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardPrimary,
        borderColor: activeTheme.cardBorder
      }}
    >
      <Button
        type="button"
        onClick={() => setMode('light')}
        variant="ghost"
        size="sm"
        className="rounded-full border-0 px-3"
        style={
          mode === 'light'
            ? {
                backgroundColor: activeTheme.heroSurface,
                color: '#17181d'
              }
            : {
                color: isDark ? 'rgba(255,255,255,0.64)' : 'rgba(23,24,29,0.64)'
              }
        }
      >
        <SunMedium size={15} strokeWidth={2.1} />
        <span className="sr-only">Switch to light mode</span>
      </Button>
      <Button
        type="button"
        onClick={() => setMode('dark')}
        variant="ghost"
        size="sm"
        className="rounded-full border-0 px-3"
        style={
          mode === 'dark'
            ? {
                backgroundColor: activeTheme.metricsPanel,
                color: '#ffffff'
              }
            : {
                color: isDark ? 'rgba(255,255,255,0.64)' : 'rgba(23,24,29,0.64)'
              }
        }
      >
        <Moon size={15} strokeWidth={2.1} />
        <span className="sr-only">Switch to dark mode</span>
      </Button>
    </div>
  );
}
