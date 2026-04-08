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
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <WorkspaceNavbar />

        <section className="rounded-soft border border-black/5 bg-white/90 px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-ember">About</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight text-ink sm:text-5xl">
            A transparent look at how ObjectAtlas is being shaped.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">
            This page keeps the implementation and project-direction notes out of the main object
            experience, while still making the product choices and build approach easy to
            understand.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className="rounded-soft border border-black/5 bg-white/85 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
              Product direction
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/75">
              {productNotes.map((item) => (
                <li key={item} className="rounded-2xl bg-clay px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-soft border border-black/5 bg-ink p-5 text-white sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand">
              Implementation notes
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              {technicalNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="rounded-soft border border-black/5 bg-[#fff7f1] px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
            Contribute
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
            Follow the project and help shape it in public.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/75">
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
              Visit the GitHub project
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
