import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { SiteFooter } from '../components/site-footer';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'ObjectAtlas',
  description: 'Mobile-first cataloging for physical objects and QR-linked public pages.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="font-[family-name:var(--font-body)] antialiased">
        <ThemeProvider>
          <div style={{ isolation: 'isolate' }} className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
