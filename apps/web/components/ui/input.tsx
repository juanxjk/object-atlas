'use client';

import { Input as BaseInput } from '@base-ui/react/input';

import { cn } from '../../lib/cn';

export function Input({
  className,
  ...props
}: BaseInput.Props & {
  className?: string;
}) {
  return (
    <BaseInput
      {...props}
      className={cn(
        'w-full rounded-2xl border border-sand bg-clay px-4 py-3 text-sm text-ink outline-none ring-0 placeholder:text-ink/45',
        className
      )}
    />
  );
}
