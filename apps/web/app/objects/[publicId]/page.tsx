import { notFound } from 'next/navigation';

import { getPublicObject, type PublicObjectRecord } from '../../../lib/object-api';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium'
  }).format(new Date(value));
}

function MediaList({ media }: { media: PublicObjectRecord['media'] }) {
  if (media.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 px-4 py-4 text-sm text-ink/70">
        No media has been attached to this object yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {media.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-sand bg-white/85 px-4 py-4 text-sm text-ink"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{item.originalFilename}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/55">
                {item.mimeType}
              </p>
            </div>
            <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              {(item.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PublicObjectPage({
  params
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const object = await getPublicObject(publicId);

  if (!object) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <section className="rounded-soft border border-black/5 bg-white/90 p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
            Public object page
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-ink sm:text-5xl">
            {object.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-ink/70">
            {object.description ?? 'No public description has been added yet.'}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-clay px-4 py-4 text-sm text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                Public identifier
              </p>
              <p className="mt-2 break-all">{object.publicId}</p>
            </div>

            <div className="rounded-2xl bg-clay px-4 py-4 text-sm text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                Last updated
              </p>
              <p className="mt-2">{formatDate(object.updatedAt)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-soft border border-black/5 bg-white/85 p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Story</p>
          <div className="mt-4 rounded-2xl bg-clay px-4 py-4 text-sm leading-7 text-ink/80">
            {object.story ?? 'A story for this object has not been published yet.'}
          </div>
        </section>

        <section className="rounded-soft border border-black/5 bg-white/85 p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Media</p>
          <div className="mt-4">
            <MediaList media={object.media} />
          </div>
        </section>
      </div>
    </main>
  );
}
