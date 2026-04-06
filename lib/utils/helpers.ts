import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Mood, PriceLevel, Cafe } from '@/types';

// ─── Tailwind merge helper ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Price level display ──────────────────────────────────────────────────────
export function formatPriceLevel(level: PriceLevel): string {
  const signs = ['Free', '$', '$$', '$$$', '$$$$'];
  return signs[level] || '$$';
}

export function getPriceLevelLabel(level: PriceLevel): string {
  const labels = ['Free', 'Inexpensive', 'Moderate', 'Expensive', 'Very Expensive'];
  return labels[level] || 'Moderate';
}

// ─── Rating display ───────────────────────────────────────────────────────────
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 4.0) return 'text-accent';
  if (rating >= 3.5) return 'text-yellow-500';
  return 'text-red-400';
}

// ─── Distance formatting ──────────────────────────────────────────────────────
export function formatDistance(meters?: number): string {
  if (!meters) return '';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// ─── Mood configuration ───────────────────────────────────────────────────────
export const MOOD_CONFIG: Record<
  Mood,
  { label: string; emoji: string; color: string; gradient: string; searchHint: string }
> = {
  romantic: {
    label: 'Romantic',
    emoji: '🌹',
    color: '#E8536A',
    gradient: 'from-rose-500/20 to-pink-500/10',
    searchHint: 'intimate cozy ambiance',
  },
  work: {
    label: 'Work / Focus',
    emoji: '💻',
    color: '#5B8AF0',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    searchHint: 'wifi quiet workspace',
  },
  chill: {
    label: 'Chill',
    emoji: '🌿',
    color: '#4CAF50',
    gradient: 'from-green-500/20 to-emerald-500/10',
    searchHint: 'relaxed comfortable outdoor',
  },
  social: {
    label: 'Social',
    emoji: '🎉',
    color: '#FF8C42',
    gradient: 'from-orange-500/20 to-amber-500/10',
    searchHint: 'lively social group',
  },
  study: {
    label: 'Study',
    emoji: '📚',
    color: '#8B5CF6',
    gradient: 'from-purple-500/20 to-violet-500/10',
    searchHint: 'quiet wifi study space',
  },
  date: {
    label: 'Date Night',
    emoji: '✨',
    color: '#EC4899',
    gradient: 'from-pink-500/20 to-rose-500/10',
    searchHint: 'romantic candlelit intimate',
  },
  quick: {
    label: 'Quick Stop',
    emoji: '⚡',
    color: '#F59E0B',
    gradient: 'from-yellow-500/20 to-amber-500/10',
    searchHint: 'fast service takeaway',
  },
  default: {
    label: 'Discover',
    emoji: '☕',
    color: '#D4A853',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    searchHint: 'cafe coffee',
  },
};

// ─── Generate spin wheel colors ───────────────────────────────────────────────
export const WHEEL_COLORS = [
  '#D4A853', '#E8536A', '#5B8AF0', '#4CAF50',
  '#FF8C42', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#3B82F6', '#EF4444', '#6366F1',
];

// ─── Truncate text ────────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '…';
}

// ─── Format review count ──────────────────────────────────────────────────────
export function formatReviewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

// ─── Get best photo URL ────────────────────────────────────────────────────────
export function getCafePrimaryPhoto(cafe: Cafe): string {
  return (
    cafe.photos[0]?.url ||
    `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80`
  );
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Generate unique ID ───────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Sort cafes ───────────────────────────────────────────────────────────────
export function sortCafes(
  cafes: Cafe[],
  sortBy: 'rating' | 'distance' | 'relevance' | 'reviews'
): Cafe[] {
  return [...cafes].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      case 'reviews':
        return b.user_ratings_total - a.user_ratings_total;
      case 'relevance':
      default:
        return (b.ai_score ?? 0) - (a.ai_score ?? 0);
    }
  });
}

// ─── Filter cafes ─────────────────────────────────────────────────────────────
export function filterCafes(
  cafes: Cafe[],
  filters: {
    minRating?: number;
    priceLevel?: number[];
    maxDistance?: number;
    openNow?: boolean;
    hasWifi?: boolean;
    hasOutdoor?: boolean;
  }
): Cafe[] {
  return cafes.filter((cafe) => {
    if (filters.minRating && cafe.rating < filters.minRating) return false;
    if (filters.priceLevel?.length && !filters.priceLevel.includes(cafe.price_level)) return false;
    if (filters.maxDistance && cafe.distance && cafe.distance > filters.maxDistance) return false;
    if (filters.openNow && cafe.hours && !cafe.hours.open_now) return false;
    if (filters.hasWifi && !cafe.amenities.wifi) return false;
    if (filters.hasOutdoor && !cafe.amenities.outdoor_seating) return false;
    return true;
  });
}

// ─── Mock/demo cafes for development ─────────────────────────────────────────
export const DEMO_CAFES: Cafe[] = [
  {
    id: 'demo_1',
    place_id: 'demo_1',
    name: 'The Brew Lab',
    address: '42 Coffee Street, SoHo, New York',
    coordinates: { lat: 40.726, lng: -74.005 },
    rating: 4.8,
    user_ratings_total: 1243,
    price_level: 2,
    photos: [
      { url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
    ],
    hours: { open_now: true, weekday_text: ['Monday: 7:00 AM – 9:00 PM'] },
    reviews: [],
    amenities: { wifi: true, outdoor_seating: true, power_outlets: true },
    types: ['cafe', 'food'],
    is_featured: true,
    ai_summary: 'A beloved artisan coffee shop known for its pour-over mastery and cozy industrial aesthetic.',
    mood_tags: ['work', 'chill', 'study'],
  },
  {
    id: 'demo_2',
    place_id: 'demo_2',
    name: 'Velvet & Cream',
    address: '8 Rose Lane, West Village, New York',
    coordinates: { lat: 40.735, lng: -74.002 },
    rating: 4.9,
    user_ratings_total: 876,
    price_level: 3,
    photos: [
      { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80' },
    ],
    hours: { open_now: true },
    reviews: [],
    amenities: { wifi: false, outdoor_seating: true },
    types: ['cafe', 'bakery'],
    is_featured: true,
    ai_summary: 'Exquisitely romantic with deep red velvet sofas, candle light, and expertly crafted lattes.',
    mood_tags: ['romantic', 'date'],
  },
  {
    id: 'demo_3',
    place_id: 'demo_3',
    name: 'Terminal 9 Coffee',
    address: '9 Tech Hub Ave, Brooklyn, New York',
    coordinates: { lat: 40.692, lng: -73.990 },
    rating: 4.7,
    user_ratings_total: 2341,
    price_level: 2,
    photos: [
      { url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80' },
    ],
    hours: { open_now: true },
    reviews: [],
    amenities: { wifi: true, power_outlets: true, outdoor_seating: false },
    types: ['cafe'],
    ai_summary: 'The go-to spot for developers and designers: blazing-fast WiFi, ample outlets, and silence-respecting regulars.',
    mood_tags: ['work', 'study'],
  },
  {
    id: 'demo_4',
    place_id: 'demo_4',
    name: 'Sunday Morning',
    address: '21 Park Side Blvd, Upper East Side',
    coordinates: { lat: 40.769, lng: -73.959 },
    rating: 4.6,
    user_ratings_total: 567,
    price_level: 2,
    photos: [
      { url: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&q=80' },
    ],
    hours: { open_now: false },
    reviews: [],
    amenities: { outdoor_seating: true, pet_friendly: true },
    types: ['cafe', 'brunch'],
    ai_summary: 'Relaxed garden cafe perfect for lazy mornings with organic pastries and natural light flooding every corner.',
    mood_tags: ['chill', 'social'],
  },
  {
    id: 'demo_5',
    place_id: 'demo_5',
    name: 'Espresso Noir',
    address: '5 Midnight Alley, East Village',
    coordinates: { lat: 40.726, lng: -73.981 },
    rating: 4.5,
    user_ratings_total: 1892,
    price_level: 1,
    photos: [
      { url: 'https://images.unsplash.com/photo-1513267048331-5611cad62e41?w=800&q=80' },
    ],
    hours: { open_now: true },
    reviews: [],
    amenities: { wifi: true, outdoor_seating: false },
    types: ['cafe'],
    ai_summary: 'Dark, moody, and impossibly cool. Italian-style espresso bar that\'s affordable without sacrificing an ounce of quality.',
    mood_tags: ['quick', 'work', 'default'],
  },
  {
    id: 'demo_6',
    place_id: 'demo_6',
    name: 'The Garden Roast',
    address: '77 Greenway Path, Chelsea',
    coordinates: { lat: 40.742, lng: -74.001 },
    rating: 4.7,
    user_ratings_total: 1105,
    price_level: 2,
    photos: [
      { url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80' },
    ],
    hours: { open_now: true },
    reviews: [],
    amenities: { outdoor_seating: true, pet_friendly: true, wifi: true },
    types: ['cafe'],
    is_trending: true,
    ai_summary: 'Plant-filled oasis in the city with a stunning rooftop terrace and weekend brunch that draws long queues.',
    mood_tags: ['social', 'romantic', 'chill'],
  },
];
