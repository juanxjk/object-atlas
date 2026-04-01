import { ObjectWorkspace } from '../components/object-workspace';
import { WorkspaceNavbar } from '../components/workspace-navbar';
import { getObjects } from '../lib/object-api';

const highlights = [
  'Capture the identity, story, and context of each object in one place',
  'Share a public page instantly through a QR code attached to the physical item',
  'Keep records easy to browse and update as collections grow'
];

export default async function HomePage() {
  const objects = await getObjects();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <WorkspaceNavbar />

        <section className="overflow-hidden rounded-soft border border-black/5 bg-white/90 shadow-card">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              ObjectAtlas
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-ember">
                Object records with public stories
              </p>
              <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight text-ink sm:text-5xl">
                Give each object a record people can open, read, and remember.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/70">
                ObjectAtlas connects physical objects to digital profiles with clear descriptions,
                rich stories, attached media, and QR-linked public pages.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <article className="rounded-soft border border-black/5 bg-white/85 p-5 shadow-card sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
              What you can do
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/75">
              {highlights.map((item) => (
                <li key={item} className="rounded-2xl bg-clay px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-soft border border-black/5 bg-ink p-5 text-white shadow-card sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand">
              Public experience
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              <p>Open an object page from the attached QR code</p>
              <p>Read the story, summary, and supporting context clearly</p>
              <p>Browse media connected to the object record</p>
            </div>
          </aside>
        </section>

        <ObjectWorkspace initialObjects={objects} />
      </div>
    </main>
  );
}
