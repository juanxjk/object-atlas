import { FolderGit2, Home, Info } from 'lucide-react';

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
  return (
    <footer className="border-t border-black/8 bg-white/55">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
              ObjectAtlas
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/68">
              A calm home for object records, public stories, and QR-linked pages.
            </p>
            <Button
              href={githubRepositoryUrl}
              target="_blank"
              rel="noreferrer"
              variant="link"
              className="mt-3 px-0 py-0 font-medium"
            >
              <FolderGit2 size={16} strokeWidth={2.1} />
              View the GitHub repository
            </Button>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm text-ink/72">
            {footerLinks.map((link) => (
              <Button
                key={link.href}
                href={link.href}
                variant="secondary"
                className="bg-white/70 font-medium hover:bg-white"
              >
                <link.icon size={16} strokeWidth={2.1} />
                {link.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="border-t border-black/6 pt-4 text-xs uppercase tracking-[0.16em] text-ink/48">
          Physical objects, readable memory.
        </div>
      </div>
    </footer>
  );
}
