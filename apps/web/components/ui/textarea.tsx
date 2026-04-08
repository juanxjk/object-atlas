'use client';

import type { TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0 placeholder:text-ink/45',
        className
      )}
    />
  );
}
