'use client';

import { cn } from '@/lib/utils/helpers';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-text-secondary border border-border',
  accent: 'bg-accent-light text-accent border border-accent/30',
  success: 'bg-green-500/10 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  outline: 'border border-border-strong text-text-secondary',
};

export function Badge({ variant = 'default', size = 'sm', children, className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
}

export function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge variant={isOpen ? 'success' : 'danger'}>
      <span className={cn('w-1.5 h-1.5 rounded-full', isOpen ? 'bg-green-400' : 'bg-red-400')} />
      {isOpen ? 'Open Now' : 'Closed'}
    </Badge>
  );
}

export function PriceBadge({ level }: { level: number }) {
  const signs = ['Free', '$', '$$', '$$$', '$$$$'];
  return <Badge variant="outline">{signs[level] || '$$'}</Badge>;
}

export function TrendingBadge() {
  return (
    <Badge variant="accent" className="gap-1">
      <span>🔥</span>
      Trending
    </Badge>
  );
}

export function FeaturedBadge() {
  return (
    <Badge variant="accent">
      ✦ Featured
    </Badge>
  );
}
