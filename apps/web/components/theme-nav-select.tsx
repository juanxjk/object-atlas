'use client';

import { ChevronDown, Palette } from 'lucide-react';
import { Select } from '@base-ui/react/select';

import { themeOptions, useTheme } from './theme-provider';

export function ThemeNavSelect() {
  const { setThemeKey, themeKey } = useTheme();

  return (
    <Select.Root
      value={themeKey}
      onValueChange={(value) => {
        if (value) {
          setThemeKey(value);
        }
      }}
    >
      <Select.Trigger className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/92 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white">
        <Palette size={15} strokeWidth={2.1} />
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={14} strokeWidth={2.1} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={8}>
          <Select.Popup className="z-50 min-w-[14rem] overflow-hidden rounded-[1.25rem] border border-black/8 bg-white p-2 text-ink shadow-lg">
            <Select.List className="space-y-1">
              {themeOptions.map((option) => (
                <Select.Item
                  key={option.key}
                  value={option.key}
                  className="flex cursor-default items-center justify-between rounded-[1rem] px-3 py-2.5 outline-none transition data-[highlighted]:bg-clay data-[selected]:bg-[#f4ede3]"
                >
                  <div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-ink/48">
                      {option.description}
                    </p>
                  </div>
                  <Select.ItemIndicator className="text-xs font-semibold uppercase tracking-[0.14em] text-ember">
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
