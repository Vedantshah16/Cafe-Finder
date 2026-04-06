'use client';

import { motion } from 'framer-motion';
import { Wifi, Trees, Clock, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/helpers';

const PRICE_LEVELS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

const RATINGS = [3, 3.5, 4, 4.5];

export default function FiltersPanel() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const hasActiveFilters =
    filters.openNow || filters.hasWifi || filters.hasOutdoor || filters.minRating > 0;

  const togglePriceLevel = (level: number) => {
    const current = filters.priceLevel;
    const updated = current.includes(level as 0)
      ? current.filter((p) => p !== level)
      : [...current, level as 0];
    setFilters({ priceLevel: updated.length > 0 ? updated : [0, 1, 2, 3, 4] });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Price */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted font-medium">Price:</span>
        <div className="flex gap-1">
          {PRICE_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => togglePriceLevel(value)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg border transition-all duration-200',
                filters.priceLevel.includes(value as 0)
                  ? 'bg-accent-light border-accent/40 text-accent'
                  : 'bg-surface-elevated border-border text-text-muted hover:border-border-strong'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted font-medium">Min rating:</span>
        <div className="flex gap-1">
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() => setFilters({ minRating: filters.minRating === r ? 0 : r })}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg border transition-all duration-200',
                filters.minRating === r
                  ? 'bg-accent-light border-accent/40 text-accent'
                  : 'bg-surface-elevated border-border text-text-muted hover:border-border-strong'
              )}
            >
              {r}★+
            </button>
          ))}
        </div>
      </div>

      {/* Toggle filters */}
      <div className="flex items-center gap-2">
        {[
          { key: 'openNow', icon: Clock, label: 'Open now' },
          { key: 'hasWifi', icon: Wifi, label: 'WiFi' },
          { key: 'hasOutdoor', icon: Trees, label: 'Outdoor' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setFilters({ [key]: !filters[key as keyof typeof filters] })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all duration-200',
              filters[key as keyof typeof filters]
                ? 'bg-accent-light border-accent/40 text-accent'
                : 'bg-surface-elevated border-border text-text-muted hover:border-border-strong'
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <X size={12} />
          Reset
        </motion.button>
      )}
    </div>
  );
}
