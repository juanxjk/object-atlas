'use client';

import { ChevronDown, Palette } from 'lucide-react';
import { Select } from '@base-ui/react/select';

import { themeStyles } from './theme-styles';
import { themeOptions, useTheme } from './theme-provider';

export function ThemeNavSelect() {
  const { mode, setThemeKey, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  return (
    <Select.Root
      value={themeKey}
      onValueChange={(value) => {
        if (value) {
          setThemeKey(value);
        }
      }}
    >
      <Select.Trigger
        className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition"
        style={{
          backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.cardPrimary,
          borderColor: activeTheme.cardBorder,
          color: isDark ? '#f7f3ee' : '#17181d'
        }}
      >
        <Palette size={15} strokeWidth={2.1} />
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={14} strokeWidth={2.1} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={8}>
          <Select.Popup
            className="z-50 min-w-[14rem] overflow-hidden rounded-[1.25rem] border p-2 shadow-lg"
            style={{
              backgroundColor: isDark ? activeTheme.metricsPanel : activeTheme.cardPrimary,
              borderColor: activeTheme.cardBorder,
              color: isDark ? '#f7f3ee' : '#17181d'
            }}
          >
            <Select.List className="space-y-1">
              {themeOptions.map((option) => (
                <Select.Item
                  key={option.key}
                  value={option.key}
                  className="flex cursor-default items-center justify-between rounded-[1rem] px-3 py-2.5 outline-none transition"
                  style={{
                    backgroundColor:
                      option.key === themeKey
                        ? activeTheme.heroSurface
                        : 'transparent'
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p
                      className="mt-0.5 text-xs uppercase tracking-[0.12em]"
                      style={{
                        color:
                          option.key === themeKey
                            ? activeTheme.cardMetaText
                            : isDark
                              ? 'rgba(255,255,255,0.56)'
                              : 'rgba(23,24,29,0.48)'
                      }}
                    >
                      {option.description}
                    </p>
                  </div>
                  <Select.ItemIndicator
                    className="text-xs font-semibold uppercase tracking-[0.14em]"
                    style={{ color: activeTheme.accent }}
                  >
                    On
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
