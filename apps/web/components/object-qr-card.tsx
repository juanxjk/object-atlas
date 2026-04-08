'use client';

import { Link2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import QRCode from 'qrcode';

export function ObjectQrCard({
  publicId,
  title,
  actionSlot
}: {
  publicId: string;
  title: string;
  actionSlot?: ReactNode;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const publicObjectUrl = `${publicAppUrl}/objects/${publicId}`;

  useEffect(() => {
    async function generateQr(): Promise<void> {
      try {
        const dataUrl = await QRCode.toDataURL(publicObjectUrl, {
          margin: 1,
          width: 240,
          color: {
            dark: '#101523',
            light: '#0000'
          }
        });

        setQrDataUrl(dataUrl);
      } catch (error) {
        setQrError(error instanceof Error ? error.message : 'Unable to generate QR code');
      }
    }

    void generateQr();
  }, [publicObjectUrl]);

  return (
    <div className="rounded-soft border border-black/8 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
            QR access
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-ink">
            Public object link
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Use this QR code on the physical object so visitors can open the public page directly.
          </p>
        </div>

        {actionSlot ? <div className="shrink-0">{actionSlot}</div> : null}
      </div>

      <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-[#f5efe7] px-4 py-5">
        {qrDataUrl ? (
          <Image
            src={qrDataUrl}
            alt={`QR code for ${title}`}
            width={240}
            height={240}
            className="rounded-2xl bg-white p-3"
            unoptimized
          />
        ) : (
          <div className="flex h-[240px] w-[240px] items-center justify-center rounded-2xl bg-white text-sm text-ink/60">
            {qrError ? 'QR unavailable' : 'Generating QR code...'}
          </div>
        )}

        <div className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-ink">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
            <Link2 size={14} strokeWidth={2.1} />
            Public URL
          </p>
          <p className="mt-2 break-all">{publicObjectUrl}</p>
        </div>
      </div>
    </div>
  );
}
