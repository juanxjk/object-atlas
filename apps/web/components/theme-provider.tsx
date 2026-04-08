'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeKey = 'atlas' | 'gallery' | 'nocturne' | 'dreamland';

const modeStorageKey = 'object-atlas-theme-mode';
const themeKeyStorageKey = 'object-atlas-theme-key';

export const themeOptions: Array<{
  description: string;
  key: ThemeKey;
  label: string;
}> = [
  {
    key: 'atlas',
    label: 'Atlas',
    description: 'Warm editorial neutrals'
  },
  {
    key: 'gallery',
    label: 'Gallery',
    description: 'Soft museum greens and stone'
  },
  {
    key: 'nocturne',
    label: 'Nocturne',
    description: 'Deeper contrast with blue-charcoal accents'
  },
  {
    key: 'dreamland',
    label: 'Pastel Dreamland Adventure',
    description: 'Playful pastels from the provided Coolors palette'
  }
];

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  setThemeKey: (themeKey: ThemeKey) => void;
  themeKey: ThemeKey;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [themeKey, setThemeKeyState] = useState<ThemeKey>('atlas');

  useEffect(() => {
    const storedMode = window.localStorage.getItem(modeStorageKey);
    const storedThemeKey = window.localStorage.getItem(themeKeyStorageKey);

    if (storedMode === 'light' || storedMode === 'dark') {
      setModeState(storedMode);
    } else {
      const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      setModeState(preferredTheme);
    }

    if (
      storedThemeKey === 'atlas' ||
      storedThemeKey === 'gallery' ||
      storedThemeKey === 'nocturne' ||
      storedThemeKey === 'dreamland'
    ) {
      setThemeKeyState(storedThemeKey);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.themeKey = themeKey;
    document.documentElement.style.colorScheme = mode;
    window.localStorage.setItem(modeStorageKey, mode);
    window.localStorage.setItem(themeKeyStorageKey, themeKey);
  }, [mode, themeKey]);

  const value = useMemo(
    () => ({
      mode,
      setMode: setModeState,
      setThemeKey: setThemeKeyState,
      themeKey
    }),
    [mode, themeKey]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
