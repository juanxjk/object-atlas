'use client';

import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ObjectMediaRecord } from '@object-atlas/types';

import { Button } from './ui/button';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function toMediaUrl(storagePath: string): string {
  return `${apiBaseUrl}/uploads/${storagePath}`;
}

export function PublicMediaCarousel({
  media
}: {
  media: ObjectMediaRecord[];
}) {
  const imageMedia = useMemo(
    () => media.filter((item) => item.mimeType.startsWith('image/')),
    [media]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  if (imageMedia.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 px-4 py-4 text-sm text-ink/70">
        No images have been attached to this object yet.
      </div>
    );
  }

  const currentImage = imageMedia[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((index) => (index === 0 ? imageMedia.length - 1 : index - 1));
  };

  const handleNext = () => {
    setCurrentIndex((index) => (index === imageMedia.length - 1 ? 0 : index + 1));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-black/5 bg-clay">
        <div className="aspect-[4/3] bg-white">
          <img
            src={toMediaUrl(currentImage.storagePath)}
            alt={currentImage.originalFilename}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-white/80 px-4 py-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              <ImageIcon size={14} strokeWidth={2.1} />
              Image {currentIndex + 1} of {imageMedia.length}
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-ink">
              {currentImage.originalFilename}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={handlePrevious} variant="secondary">
              <ChevronLeft size={16} strokeWidth={2.1} />
              Prev
            </Button>
            <Button type="button" onClick={handleNext} variant="secondary">
              Next
              <ChevronRight size={16} strokeWidth={2.1} />
            </Button>
          </div>
        </div>
      </div>

      {imageMedia.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {imageMedia.map((item, index) => {
            const isActive = index === currentIndex;

            return (
              <Button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                variant="secondary"
                className={`overflow-hidden rounded-2xl border p-0 ${
                  isActive ? 'border-ember' : 'border-black/5'
                }`}
              >
                <img
                  src={toMediaUrl(item.storagePath)}
                  alt={item.originalFilename}
                  className="aspect-square h-full w-full object-cover"
                />
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
