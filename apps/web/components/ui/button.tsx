'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { themeStyles } from '../theme-styles';
import { useTheme } from '../theme-provider';

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
  primary: '',
  secondary: 'border',
  ghost: 'border',
  danger: 'border',
  soft: '',
  chip: '',
  'chip-active': '',
  link: 'underline-offset-4 hover:underline'
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
  style,
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
  const { mode, themeKey } = useTheme();
  const activeTheme = themeStyles[themeKey];
  const isDark = mode === 'dark';

  const variantThemeStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      backgroundColor: activeTheme.chipActiveBg,
      color: activeTheme.chipActiveText,
      borderColor: activeTheme.chipActiveBg
    },
    secondary: {
      backgroundColor: isDark ? activeTheme.secondaryPanel : activeTheme.badgeBg,
      color: isDark ? '#f7f3ee' : '#17181d',
      borderColor: activeTheme.cardBorder
    },
    ghost: {
      backgroundColor: isDark ? activeTheme.cardMuted : activeTheme.cardMuted,
      color: isDark ? '#f7f3ee' : '#17181d',
      borderColor: activeTheme.cardBorder
    },
    danger: {
      backgroundColor: isDark ? 'rgba(248, 81, 73, 0.14)' : '#fff5f5',
      color: '#d1242f',
      borderColor: isDark ? 'rgba(248, 81, 73, 0.35)' : '#f3b7bd'
    },
    soft: {
      backgroundColor: activeTheme.accent,
      color: themeKey === 'dreamland' ? '#352a45' : '#ffffff',
      borderColor: activeTheme.accent
    },
    chip: {
      backgroundColor: activeTheme.chipBg,
      color: activeTheme.chipText,
      borderColor: activeTheme.cardBorder
    },
    'chip-active': {
      backgroundColor: activeTheme.chipActiveBg,
      color: activeTheme.chipActiveText,
      borderColor: activeTheme.chipActiveBg
    },
    link: {
      color: activeTheme.accent
    }
  };

  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-60',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const mergedStyle = {
    ...variantThemeStyles[variant],
    ...style
  };

  if (href?.startsWith('/')) {
    return (
      <BaseButton
        {...props}
        nativeButton={false}
        className={classes}
        style={mergedStyle}
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
        nativeButton={false}
        className={classes}
        style={mergedStyle}
        render={<a href={href} target={target} rel={rel} />}
      >
        {children}
      </BaseButton>
    );
  }

  return (
    <BaseButton {...props} className={classes} style={mergedStyle}>
      {children}
    </BaseButton>
  );
}
