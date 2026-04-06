'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, Sparkles, X } from 'lucide-react';
import { cn, debounce } from '@/lib/utils/helpers';
import { useAppStore } from '@/store/useAppStore';
import { useLocation } from '@/hooks/useLocation';
import axios from 'axios';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  onSearch?: (query: string) => void;
  className?: string;
}

const QUICK_SUGGESTIONS = [
  'Romantic cafe with dim lights',
  'Work-friendly cafe with fast WiFi',
  'Cheap coffee near me',
  'Quiet study spot',
  'Pet-friendly cafe outdoor',
  'Best espresso in town',
];

export default function SearchBar({ variant = 'compact', onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setSearchQuery } = useAppStore();
  const { requestLocation, location, isLoading: locationLoading } = useLocation();

  // Listen for hero tag clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      setQuery(detail);
      inputRef.current?.focus();
    };
    window.addEventListener('hero-search', handler);
    return () => window.removeEventListener('hero-search', handler);
  }, []);

  const fetchLocationSuggestions = useCallback(
    debounce(async (input: string) => {
      if (input.length < 2) {
        setLocationSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get('/api/cafes/autocomplete', { params: { input } });
        setLocationSuggestions(data.data || []);
      } catch {
        setLocationSuggestions([]);
      }
    }, 400),
    []
  );

  useEffect(() => {
    fetchLocationSuggestions(locationQuery);
  }, [locationQuery, fetchLocationSuggestions]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchQuery(searchQuery);
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
    setIsSearching(false);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  if (variant === 'hero') {
    return (
      <div className={cn('relative w-full', className)}>
        <motion.div
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex items-center bg-surface border rounded-2xl overflow-hidden transition-all duration-300',
            isFocused
              ? 'border-accent/50 shadow-accent-lg ring-4 ring-accent/10'
              : 'border-border hover:border-border-strong shadow-glass'
          )}
        >
          {/* Search icon */}
          <div className="pl-5 pr-2 flex-shrink-0">
            {isSearching ? (
              <Loader2 size={20} className="text-accent animate-spin" />
            ) : (
              <Search size={20} className="text-text-muted" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder='Try "romantic cafe" or "work with wifi"…'
            className="flex-1 bg-transparent py-4 text-base text-text-primary placeholder:text-text-muted outline-none"
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-2 text-text-muted hover:text-text-secondary transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Location button */}
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 px-4 py-4 border-l border-border text-sm text-text-secondary hover:text-accent hover:bg-accent-light transition-colors flex-shrink-0"
          >
            {locationLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} className={cn(location && 'text-accent')} />
            )}
            <span className="hidden sm:inline">{location ? 'Located' : 'Near me'}</span>
          </button>

          {/* Search button */}
          <button
            onClick={() => handleSearch()}
            className="flex items-center gap-2 px-5 py-4 bg-accent hover:bg-accent-hover text-black text-sm font-semibold transition-colors flex-shrink-0"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </motion.div>

        {/* Dropdown suggestions */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-glass-lg z-20 overflow-hidden"
            >
              {query.length === 0 && (
                <div className="p-3">
                  <p className="text-xs font-medium text-text-muted px-2 pb-2">Try these searches</p>
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onMouseDown={() => {
                        setQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors text-left"
                    >
                      <Sparkles size={14} className="text-accent flex-shrink-0" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center bg-surface border rounded-xl transition-all duration-200',
          isFocused ? 'border-accent/50 ring-2 ring-accent/10' : 'border-border'
        )}
      >
        <Search size={16} className="ml-3 text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search cafes…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="pr-3 text-text-muted hover:text-text-secondary">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
