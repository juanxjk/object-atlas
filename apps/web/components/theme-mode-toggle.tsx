'use client';

import { Moon, SunMedium } from 'lucide-react';

import { useTheme } from './theme-provider';
import { Button } from './ui/button';

export function ThemeModeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-sand bg-white/92 p-1">
      <Button
        type="button"
        onClick={() => setMode('light')}
        variant="ghost"
        size="sm"
        className={`rounded-full border-0 px-3 ${
          mode === 'light'
            ? 'bg-[#f4ede3] text-ink hover:bg-[#f4ede3]'
            : 'bg-transparent text-ink/64 hover:bg-[#f7f1e9]'
        }`}
      >
        <SunMedium size={15} strokeWidth={2.1} />
        <span className="sr-only">Switch to light mode</span>
      </Button>
      <Button
        type="button"
        onClick={() => setMode('dark')}
        variant="ghost"
        size="sm"
        className={`rounded-full border-0 px-3 ${
          mode === 'dark'
            ? 'bg-[#1f2430] text-white hover:bg-[#1f2430]'
            : 'bg-transparent text-ink/64 hover:bg-[#f7f1e9]'
        }`}
      >
        <Moon size={15} strokeWidth={2.1} />
        <span className="sr-only">Switch to dark mode</span>
      </Button>
    </div>
  );
}
