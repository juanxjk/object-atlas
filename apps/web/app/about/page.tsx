'use client';

import { BookOpen, Code2, FolderGit2 } from 'lucide-react';

import { themeStyles } from '../../components/theme-styles';
import { useTheme } from '../../components/theme-provider';
import { WorkspaceNavbar } from '../../components/workspace-navbar';
import { Button } from '../../components/ui/button';

const githubRepositoryUrl = 'https://github.com/juanxjk/object-atlas';

const productNotes = [
  'ObjectAtlas is being built as a web experience for documenting physical objects and connecting them to public pages.',
  'The project is intentionally transparent about being developed with AI-assisted code generation under human guidance.',
  'The current direction focuses on a practical foundation first, with room to evolve storage, validation, and collaboration features over time.'
];

const technicalNotes = [
  'Frontend: Next.js with Tailwind CSS',
  'Backend: NestJS with PostgreSQL',
  'Local infrastructure: Docker Compose',
  'Media storage: filesystem-first behind a storage abstraction designed to evolve later'
];

export default function AboutPage() {
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 ${
        isDark ? activeTheme.mainBg.dark : activeTheme.mainBg.light
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <WorkspaceNavbar />

        <section
          className={`overflow-hidden rounded-[2rem] border ${
            isDark ? activeTheme.shellPanel.dark : activeTheme.shellPanel.light
          }`}
        >
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/6 p-3 text-white">
                <BookOpen size={18} strokeWidth={2.1} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.22em]"
                  style={{ color: activeTheme.accent }}
                >
                  About
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-tight text-white sm:text-5xl">
                  A transparent look at how ObjectAtlas is being shaped.
                </h1>
              </div>
            </div>

            <p className="max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
              This page keeps project-direction notes out of the main object experience while still
              making the product choices, technical baseline, and contribution path easy to
              understand.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article
            className={`rounded-[2rem] border p-5 sm:p-6 ${
              isDark ? activeTheme.surface.dark : activeTheme.surface.light
            }`}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: activeTheme.badgeText }}
            >
              Product direction
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6">
              {productNotes.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.5rem] border px-4 py-3"
                  style={{
                    backgroundColor: activeTheme.cardPrimary,
                    borderColor: activeTheme.cardBorder,
                    color: activeTheme.cardMetaText
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside
            className="rounded-[2rem] border px-5 py-6 text-white sm:p-6"
            style={{
              backgroundColor: activeTheme.metricsPanel,
              borderColor: 'rgba(255,255,255,0.08)'
            }}
          >
            <div className="flex items-center gap-2">
              <Code2 size={16} strokeWidth={2.1} style={{ color: activeTheme.accent }} />
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: activeTheme.accent }}
              >
                Technical notes
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {technicalNotes.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.25rem] bg-white/6 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section
          className={`rounded-[2rem] border p-5 sm:p-6 ${
            isDark ? activeTheme.surface.dark : activeTheme.surface.light
          }`}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: activeTheme.badgeText }}
          >
            Contribute
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
            Follow the project and help shape it in public.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: activeTheme.cardMetaText }}>
            The GitHub repository is the best place to follow progress, open issues, suggest
            improvements, and contribute code or product feedback as ObjectAtlas evolves.
          </p>
          <div className="mt-5">
            <Button
              href={githubRepositoryUrl}
              target="_blank"
              rel="noreferrer"
              variant="primary"
              size="lg"
            >
              <FolderGit2 size={16} strokeWidth={2.1} />
              Visit the GitHub project
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
