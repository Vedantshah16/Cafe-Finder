import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Cafe, Coordinates, FilterState, Mood, ViewMode } from '@/types';

interface AppState {
  // ─── Location ──────────────────────────────────────────────────────────────
  userLocation: Coordinates | null;
  locationPermission: 'granted' | 'denied' | 'pending' | null;
  setUserLocation: (loc: Coordinates | null) => void;
  setLocationPermission: (status: 'granted' | 'denied' | 'pending') => void;

  // ─── Search ────────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // ─── Current mood ──────────────────────────────────────────────────────────
  currentMood: Mood;
  setMood: (mood: Mood) => void;

  // ─── Cafes ─────────────────────────────────────────────────────────────────
  cafes: Cafe[];
  setCafes: (cafes: Cafe[]) => void;
  selectedCafe: Cafe | null;
  setSelectedCafe: (cafe: Cafe | null) => void;
  hoveredCafeId: string | null;
  setHoveredCafeId: (id: string | null) => void;

  // ─── Favorites ─────────────────────────────────────────────────────────────
  favorites: string[];
  toggleFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;

  // ─── Recently viewed ───────────────────────────────────────────────────────
  recentlyViewed: string[];
  addRecentlyViewed: (placeId: string) => void;

  // ─── Filters ───────────────────────────────────────────────────────────────
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // ─── View mode ─────────────────────────────────────────────────────────────
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // ─── UI State ──────────────────────────────────────────────────────────────
  isChatOpen: boolean;
  toggleChat: () => void;
  isSpinWheelOpen: boolean;
  toggleSpinWheel: () => void;
  isFiltersOpen: boolean;
  toggleFilters: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DEFAULT_FILTERS: FilterState = {
  priceLevel: [0, 1, 2, 3, 4],
  minRating: 0,
  maxDistance: 5000,
  openNow: false,
  hasWifi: false,
  hasOutdoor: false,
  mood: 'default',
};

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ─── Location ──────────────────────────────────────────────────────
        userLocation: null,
        locationPermission: null,
        setUserLocation: (loc) => set({ userLocation: loc }),
        setLocationPermission: (status) => set({ locationPermission: status }),

        // ─── Search ────────────────────────────────────────────────────────
        searchQuery: '',
        setSearchQuery: (q) => set({ searchQuery: q }),

        // ─── Mood ──────────────────────────────────────────────────────────
        currentMood: 'default',
        setMood: (mood) => set({ currentMood: mood }),

        // ─── Cafes ─────────────────────────────────────────────────────────
        cafes: [],
        setCafes: (cafes) => set({ cafes }),
        selectedCafe: null,
        setSelectedCafe: (cafe) => set({ selectedCafe: cafe }),
        hoveredCafeId: null,
        setHoveredCafeId: (id) => set({ hoveredCafeId: id }),

        // ─── Favorites ─────────────────────────────────────────────────────
        favorites: [],
        toggleFavorite: (placeId) => {
          const { favorites } = get();
          const updated = favorites.includes(placeId)
            ? favorites.filter((id) => id !== placeId)
            : [...favorites, placeId];
          set({ favorites: updated });
        },
        isFavorite: (placeId) => get().favorites.includes(placeId),

        // ─── Recently viewed ───────────────────────────────────────────────
        recentlyViewed: [],
        addRecentlyViewed: (placeId) => {
          const current = get().recentlyViewed.filter((id) => id !== placeId);
          set({ recentlyViewed: [placeId, ...current].slice(0, 20) });
        },

        // ─── Filters ───────────────────────────────────────────────────────
        filters: DEFAULT_FILTERS,
        setFilters: (newFilters) =>
          set((state) => ({ filters: { ...state.filters, ...newFilters } })),
        resetFilters: () => set({ filters: DEFAULT_FILTERS }),

        // ─── View mode ─────────────────────────────────────────────────────
        viewMode: 'split',
        setViewMode: (mode) => set({ viewMode: mode }),

        // ─── UI ────────────────────────────────────────────────────────────
        isChatOpen: false,
        toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
        isSpinWheelOpen: false,
        toggleSpinWheel: () => set((s) => ({ isSpinWheelOpen: !s.isSpinWheelOpen })),
        isFiltersOpen: false,
        toggleFilters: () => set((s) => ({ isFiltersOpen: !s.isFiltersOpen })),
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'cafe-finder-store',
        partialize: (state) => ({
          favorites: state.favorites,
          recentlyViewed: state.recentlyViewed,
          currentMood: state.currentMood,
          viewMode: state.viewMode,
          filters: state.filters,
        }),
      }
    )
  )
);
