'use client';

import { Moon, Palette, SunMedium } from 'lucide-react';

import { Button } from './ui/button';
import { themeOptions, type ThemeKey, useTheme } from './theme-provider';

const themeSwatches: Record<
  ThemeKey,
  {
    accent: string;
    dark: string;
    light: string;
  }
> = {
  atlas: {
    accent: '#d9b48a',
    dark: '#0f1218',
    light: '#f0e5d6'
  },
  gallery: {
    accent: '#a8c2ac',
    dark: '#102019',
    light: '#e6eee5'
  },
  nocturne: {
    accent: '#9caee6',
    dark: '#111421',
    light: '#e6e9f4'
  },
  dreamland: {
    accent: '#ffafcc',
    dark: '#6e5a84',
    light: '#ffc8dd'
  }
};

export function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { mode, setMode, setThemeKey, themeKey } = useTheme();

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-white/10 bg-white/6 p-2 text-white">
          <Palette size={16} strokeWidth={2.1} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
            Theme selector
          </p>
          <p className="mt-2 text-sm text-white/74">
            Choose a theme family and switch between light and dark presentation. The selected
            theme key is saved locally.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
        <Button
          type="button"
          onClick={() => setMode('light')}
          variant="ghost"
          size="sm"
          className={`border-0 ${
            mode === 'light'
              ? 'bg-white text-[#17181d] hover:bg-white'
              : 'bg-transparent text-white hover:bg-white/8'
          }`}
        >
          <SunMedium size={15} strokeWidth={2.1} />
          Light
        </Button>
        <Button
          type="button"
          onClick={() => setMode('dark')}
          variant="ghost"
          size="sm"
          className={`border-0 ${
            mode === 'dark'
              ? 'bg-white text-[#17181d] hover:bg-white'
              : 'bg-transparent text-white hover:bg-white/8'
          }`}
        >
          <Moon size={15} strokeWidth={2.1} />
          Dark
        </Button>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-1 lg:grid-cols-3'}`}>
        {themeOptions.map((option) => {
          const isSelected = option.key === themeKey;
          const swatch = themeSwatches[option.key];

          return (
            <Button
              key={option.key}
              type="button"
              onClick={() => setThemeKey(option.key)}
              variant="ghost"
              className={`h-auto flex-col items-start rounded-[1.25rem] border p-4 text-left ${
                isSelected
                  ? 'border-white/18 bg-white/12 text-white'
                  : 'border-white/10 bg-white/5 text-white/76 hover:bg-white/8'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/52">
                    {option.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/15"
                    style={{ backgroundColor: swatch.light }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-white/15"
                    style={{ backgroundColor: swatch.dark }}
                  />
                </div>
              </div>

              <span
                className="mt-4 text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: swatch.accent }}
              >
                {isSelected ? 'Selected' : 'Apply theme'}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
