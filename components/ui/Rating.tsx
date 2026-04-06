'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface RatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function Rating({ rating, count, size = 'sm', showCount = true, className }: RatingProps) {
  const starSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20;
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star
        size={starSize}
        className="text-accent fill-accent flex-shrink-0"
      />
      <span className={cn('font-semibold text-text-primary', textSize)}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn('text-text-muted', textSize)}>
          ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}

interface StarRowProps {
  rating: number;
  max?: number;
  size?: number;
}

export function StarRow({ rating, max = 5, size = 14 }: StarRowProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <div key={i} className="relative">
            <Star size={size} className="text-surface-hover fill-surface-hover" />
            {(filled || partial) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
              >
                <Star size={size} className="text-accent fill-accent" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
