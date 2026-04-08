'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'soft'
  | 'chip'
  | 'chip-active'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:opacity-95',
  secondary: 'border border-sand bg-white text-ink',
  ghost: 'border border-sand bg-clay text-ink',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  soft: 'bg-ember text-white hover:opacity-95',
  chip: 'bg-clay text-ink/70',
  'chip-active': 'bg-ember text-white',
  link: 'text-ember underline-offset-4 hover:underline'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-sm',
  icon: 'px-3 py-2 text-sm'
};

export function Button({
  children,
  className,
  href,
  target,
  rel,
  variant = 'secondary',
  size = 'md',
  ...props
}: Omit<BaseButton.Props, 'render'> & {
  children: ReactNode;
  className?: string;
  href?: string;
  rel?: string;
  target?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-60',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href?.startsWith('/')) {
    return (
      <BaseButton
        {...props}
        className={classes}
        render={<Link href={href} />}
      >
        {children}
      </BaseButton>
    );
  }

  if (href) {
    return (
      <BaseButton
        {...props}
        className={classes}
        render={<a href={href} target={target} rel={rel} />}
      >
        {children}
      </BaseButton>
    );
  }

  return (
    <BaseButton {...props} className={classes}>
      {children}
    </BaseButton>
  );
}
