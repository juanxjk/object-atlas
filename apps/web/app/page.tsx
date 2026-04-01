import { ObjectWorkspace } from '../components/object-workspace';
import { getObjects } from '../lib/object-api';

const priorities = [
  'Short mobile-first forms for object creation',
  'Readable public object pages with rich story content',
  'Simple media handling before storage abstraction evolves'
];

export default async function HomePage() {
  const objects = await getObjects();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-soft border border-black/5 bg-white/90 shadow-card">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              MVP Workspace
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-ember">
                ObjectAtlas
              </p>
              <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight text-ink sm:text-5xl">
                A mobile-first workspace for object records, stories, and QR-linked public pages.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/70">
                The workspace below is now connected to the API scaffold, so the MVP can create
                and update object records before media and public page work land in later steps.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <article className="rounded-soft border border-black/5 bg-white/85 p-5 shadow-card sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
              Mobile-first direction
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/75">
              {priorities.map((item) => (
                <li key={item} className="rounded-2xl bg-clay px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-soft border border-black/5 bg-ink p-5 text-white shadow-card sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand">
              Current scaffold
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              <p>Next.js App Router</p>
              <p>Tailwind CSS with a custom warm palette</p>
              <p>Object create and edit flow wired to the API</p>
            </div>
          </aside>
        </section>

        <ObjectWorkspace initialObjects={objects} />
      </div>
    </main>
  );
}
