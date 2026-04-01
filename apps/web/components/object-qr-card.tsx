'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function ObjectQrCard({
  publicId,
  title
}: {
  publicId: string;
  title: string;
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
    <div className="rounded-soft border border-black/5 bg-white/85 p-5 shadow-card sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">QR access</p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-ink">
        Public object link
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        Use this QR code on the physical object so visitors can open the public page directly.
      </p>

      <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl bg-clay px-4 py-5">
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

        <div className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-ink shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
            Public URL
          </p>
          <p className="mt-2 break-all">{publicObjectUrl}</p>
        </div>
      </div>
    </div>
  );
}
