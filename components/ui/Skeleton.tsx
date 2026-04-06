'use client';

import { cn } from '@/lib/utils/helpers';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-surface-elevated via-surface-hover to-surface-elevated',
        'bg-[length:200%_100%] animate-shimmer',
        rounded ? 'rounded-full' : 'rounded-xl',
        className
      )}
    />
  );
}

export function CafeCardSkeleton() {
  return (
    <div className="bg-surface rounded-3xl overflow-hidden border border-border">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CafeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-80 w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-surface rounded-2xl border border-border">
      <Skeleton className="h-20 w-20 flex-shrink-0 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 justify-start">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="space-y-1.5 max-w-[70%]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}
