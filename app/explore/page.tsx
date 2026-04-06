'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, List, SlidersHorizontal, Dices, Loader2, LayoutTemplate } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';
import { useCafes } from '@/hooks/useCafes';
import { useLocation } from '@/hooks/useLocation';
import CafeCard from '@/components/cafe/CafeCard';
import SearchBar from '@/components/home/SearchBar';
import SpinWheel from '@/components/ai/SpinWheel';
import FiltersPanel from '@/components/explore/FiltersPanel';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { DEMO_CAFES, filterCafes, sortCafes } from '@/lib/utils/helpers';
import type { Cafe, ViewMode } from '@/types';
import Button from '@/components/ui/Button';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-elevated rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-text-muted">
        <Loader2 size={24} className="animate-spin" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  ),
});

function ExploreContent() {
  const searchParams = useSearchParams();
  const { cafes, setCafes, viewMode, setViewMode, filters, isLoading, toggleSpinWheel, isFiltersOpen, toggleFilters, setSelectedCafe, setHoveredCafeId } = useAppStore();
  const { fetchNearbyCafes, getAIRecommendations } = useCafes();
  const { location, requestLocation } = useLocation();
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'relevance'>('relevance');
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  const q = searchParams.get('q');
  const mood = searchParams.get('mood');

  useEffect(() => {
    const init = async () => {
      if (q) {
        const result = await getAIRecommendations(q);
        if (result.length === 0) setCafes(DEMO_CAFES);
      } else if (location) {
        const result = await fetchNearbyCafes(location.lat, location.lng);
        if (result.length === 0) setCafes(DEMO_CAFES);
      } else {
        setCafes(DEMO_CAFES);
        requestLocation();
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location?.lat, location?.lng]);

  const filteredCafes = sortCafes(
    filterCafes(cafes, {
      minRating: filters.minRating,
      openNow: filters.openNow,
      hasWifi: filters.hasWifi,
      hasOutdoor: filters.hasOutdoor,
      priceLevel: filters.priceLevel,
      maxDistance: filters.maxDistance,
    }),
    sortBy
  );

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {/* Toolbar */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchBar variant="compact" />
          </div>

          {/* Filters button */}
          <Button
            variant={isFiltersOpen ? 'outline' : 'secondary'}
            size="sm"
            leftIcon={<SlidersHorizontal size={14} />}
            onClick={toggleFilters}
          >
            Filters
            {(filters.openNow || filters.hasWifi || filters.hasOutdoor) && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </Button>

          {/* Spin wheel */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Dices size={14} />}
            onClick={toggleSpinWheel}
            className="hidden sm:flex"
          >
            Spin
          </Button>

          {/* View toggle */}
          <div className="flex bg-surface-elevated border border-border rounded-xl p-0.5 gap-0.5">
            {([
              { mode: 'list', icon: List },
              { mode: 'split', icon: LayoutTemplate },
              { mode: 'map', icon: Map },
            ] as { mode: ViewMode; icon: React.ElementType }[]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-accent text-black'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Count */}
          <span className="text-sm text-text-muted hidden sm:inline whitespace-nowrap">
            {filteredCafes.length} cafes
          </span>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b border-border bg-surface/50 backdrop-blur-sm"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <FiltersPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI reasoning */}
      {aiReasoning && (
        <div className="max-w-7xl mx-auto px-4 py-3 w-full">
          <div className="flex items-start gap-2 text-sm text-text-secondary bg-accent-light border border-accent/20 rounded-xl px-4 py-3">
            <span className="text-accent flex-shrink-0">✦</span>
            <span>{aiReasoning}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ListItemSkeleton key={i} />)
              : filteredCafes.map((cafe, i) => (
                  <motion.div
                    key={cafe.place_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    onMouseEnter={() => setHoveredCafeId(cafe.place_id)}
                    onMouseLeave={() => setHoveredCafeId(null)}
                  >
                    <CafeCard cafe={cafe} />
                  </motion.div>
                ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="h-[calc(100vh-160px)]">
            <MapView cafes={filteredCafes} className="w-full h-full" />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="flex gap-5 h-[calc(100vh-180px)]">
            {/* List */}
            <div className="w-[420px] flex-shrink-0 overflow-y-auto space-y-3 pr-1">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <ListItemSkeleton key={i} />)
                : filteredCafes.map((cafe, i) => (
                    <motion.div
                      key={cafe.place_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onMouseEnter={() => {
                        setHoveredCafeId(cafe.place_id);
                        setSelectedCafe(cafe);
                      }}
                      onMouseLeave={() => setHoveredCafeId(null)}
                    >
                      <CafeCard cafe={cafe} compact />
                    </motion.div>
                  ))}
            </div>

            {/* Map */}
            <div className="flex-1 min-w-0">
              <MapView cafes={filteredCafes} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredCafes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl">☕</div>
            <h3 className="text-xl font-semibold text-text-primary">No cafes found</h3>
            <p className="text-text-secondary text-center max-w-sm">
              Try adjusting your filters or searching a different area.
            </p>
            <Button variant="primary" onClick={() => setCafes(DEMO_CAFES)}>
              Show all cafes
            </Button>
          </div>
        )}
      </div>

      <SpinWheel cafes={filteredCafes} />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
