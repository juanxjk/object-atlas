import { Settings2 } from 'lucide-react';

import { ThemeSelector } from '../../components/theme-selector';
import { WorkspaceNavbar } from '../../components/workspace-navbar';

export default function ConfigPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <WorkspaceNavbar />

        <section className="overflow-hidden rounded-soft border border-black/6 bg-[#12141a] text-white">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/6 p-3 text-white">
                <Settings2 size={18} strokeWidth={2.1} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b48a]">
                  Config
                </p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
                  Theme and interface settings
                </h1>
              </div>
            </div>

            <p className="max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
              Use this page to switch between the current theme families and light or dark mode.
              These selections are saved locally so you can compare interface directions without
              resetting the app each time.
            </p>

            <ThemeSelector />
          </div>
        </section>
      </div>
    </main>
  );
}
