import type { ThemeKey } from './theme-provider';

export type DraftThemeStyle = {
  accent: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  cardMetaText: string;
  cardMuted: string;
  cardPrimary: string;
  chipActiveBg: string;
  chipActiveText: string;
  chipBg: string;
  chipText: string;
  heroPanel: string;
  heroSurface: string;
  imageDetailBg: string;
  imageDetailPanel: string;
  imageThumbs: string[];
  listingPanel: string;
  mainBg: {
    dark: string;
    light: string;
  };
  metricsPanel: string;
  previewPanel: string;
  secondaryPanel: string;
  shellPanel: {
    dark: string;
    light: string;
  };
  surface: {
    dark: string;
    light: string;
  };
};

export const themeStyles: Record<ThemeKey, DraftThemeStyle> = {
  atlas: {
    accent: '#d9b48a',
    badgeBg: '#ffffff',
    badgeText: '#4d6c57',
    cardBorder: '#d4b08c',
    cardMetaText: '#5c5145',
    cardMuted: '#f7f1e9',
    cardPrimary: '#fff8ef',
    chipActiveBg: '#c96a37',
    chipActiveText: '#ffffff',
    chipBg: '#f1e9dc',
    chipText: '#6a6257',
    heroPanel: '#0f1218',
    heroSurface: '#f0e5d6',
    imageDetailBg: '#fffaf3',
    imageDetailPanel: '#efe2cf',
    imageThumbs: ['#d1a377', '#6f7d6a', '#9d6b54', '#8c8f9a'],
    listingPanel: '#f4ede3',
    mainBg: {
      light: 'bg-[#efe6d9] text-[#17181d]',
      dark: 'bg-[#14181f] text-[#f5eee6]'
    },
    metricsPanel: '#171c24',
    previewPanel: '#10141b',
    secondaryPanel: '#222834',
    shellPanel: {
      light: 'border-black/6 bg-[#12141a] text-white',
      dark: 'border-white/8 bg-[#0f1218] text-white'
    },
    surface: {
      light: 'border-black/6 bg-[#f7f0e7]',
      dark: 'border-white/8 bg-[#1b2028]'
    }
  },
  gallery: {
    accent: '#a8c2ac',
    badgeBg: '#f8fbf7',
    badgeText: '#466751',
    cardBorder: '#a8c2ac',
    cardMetaText: '#415647',
    cardMuted: '#edf3ec',
    cardPrimary: '#f4faf4',
    chipActiveBg: '#5f8a68',
    chipActiveText: '#ffffff',
    chipBg: '#dde8dc',
    chipText: '#4f6654',
    heroPanel: '#102019',
    heroSurface: '#e6eee5',
    imageDetailBg: '#f7fbf6',
    imageDetailPanel: '#dbe7db',
    imageThumbs: ['#95b198', '#7a8e7c', '#b8c9b6', '#8ea99a'],
    listingPanel: '#edf3ec',
    mainBg: {
      light: 'bg-[#e8efe7] text-[#172019]',
      dark: 'bg-[#111b16] text-[#edf4ee]'
    },
    metricsPanel: '#163026',
    previewPanel: '#13251d',
    secondaryPanel: '#244235',
    shellPanel: {
      light: 'border-black/6 bg-[#102019] text-white',
      dark: 'border-white/8 bg-[#0d1813] text-white'
    },
    surface: {
      light: 'border-black/6 bg-[#eef4ea]',
      dark: 'border-white/8 bg-[#18241e]'
    }
  },
  nocturne: {
    accent: '#9caee6',
    badgeBg: '#f7f8fd',
    badgeText: '#4c5d96',
    cardBorder: '#bcc7ec',
    cardMetaText: '#4e5878',
    cardMuted: '#eef1fa',
    cardPrimary: '#f7f8fd',
    chipActiveBg: '#6277bd',
    chipActiveText: '#ffffff',
    chipBg: '#dde4f8',
    chipText: '#5a6488',
    heroPanel: '#111421',
    heroSurface: '#e6e9f4',
    imageDetailBg: '#fbfbff',
    imageDetailPanel: '#dde3f4',
    imageThumbs: ['#9caee6', '#7081ba', '#b9c4eb', '#818baf'],
    listingPanel: '#eceff8',
    mainBg: {
      light: 'bg-[#e8ebf5] text-[#171b27]',
      dark: 'bg-[#111420] text-[#eef1fb]'
    },
    metricsPanel: '#1a1f33',
    previewPanel: '#151a2c',
    secondaryPanel: '#252c46',
    shellPanel: {
      light: 'border-black/6 bg-[#111421] text-white',
      dark: 'border-white/8 bg-[#0d1019] text-white'
    },
    surface: {
      light: 'border-black/6 bg-[#eef1fa]',
      dark: 'border-white/8 bg-[#191e31]'
    }
  },
  dreamland: {
    accent: '#ffafcc',
    badgeBg: '#fff7fb',
    badgeText: '#8e5d82',
    cardBorder: '#ffc8dd',
    cardMetaText: '#7e5873',
    cardMuted: '#ffeaf3',
    cardPrimary: '#fff4fa',
    chipActiveBg: '#ff7eb0',
    chipActiveText: '#ffffff',
    chipBg: '#ffe3ef',
    chipText: '#92677f',
    heroPanel: '#6e5a84',
    heroSurface: '#ffc8dd',
    imageDetailBg: '#fff7fb',
    imageDetailPanel: '#ffdbe8',
    imageThumbs: ['#cdb4db', '#ffc8dd', '#ffafcc', '#a2d2ff'],
    listingPanel: '#bde0fe',
    mainBg: {
      light: 'bg-[#fff3f8] text-[#352a45]',
      dark: 'bg-[#2f2540] text-[#fdf3fa]'
    },
    metricsPanel: '#8d74aa',
    previewPanel: '#5f4d7c',
    secondaryPanel: '#7a68a0',
    shellPanel: {
      light: 'border-[#ffafcc]/30 bg-[#6e5a84] text-white',
      dark: 'border-[#ffc8dd]/18 bg-[#4f4068] text-white'
    },
    surface: {
      light: 'border-[#ffafcc]/28 bg-[#ffeaf3]',
      dark: 'border-[#ffc8dd]/18 bg-[#43365a]'
    }
  }
};
