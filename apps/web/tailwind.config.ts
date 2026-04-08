import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#101523',
        clay: '#f4efe8',
        ember: '#be5a38',
        moss: '#3f5c4b',
        sand: '#dcc8b0'
      },
      boxShadow: {
        card: '0 18px 45px rgba(16, 21, 35, 0.08)'
      },
      borderRadius: {
        soft: '1.5rem'
      }
    }
  },
  plugins: []
};

export default config;
