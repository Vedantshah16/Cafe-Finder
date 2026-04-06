// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAFE FINDER AI — Global Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Coordinates {
  lat: number;
  lng: number;
}

export type Mood =
  | 'romantic'
  | 'work'
  | 'chill'
  | 'social'
  | 'study'
  | 'date'
  | 'quick'
  | 'default';

export type PriceLevel = 0 | 1 | 2 | 3 | 4;

export interface CafePhoto {
  url: string;
  width?: number;
  height?: number;
  attributions?: string;
  photoReference?: string;
}

export interface CafeHours {
  open_now: boolean;
  periods?: {
    open: { day: number; time: string };
    close: { day: number; time: string };
  }[];
  weekday_text?: string[];
}

export interface CafeReview {
  id: string;
  author_name: string;
  author_photo?: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CafeAmenities {
  wifi: boolean;
  outdoor_seating: boolean;
  parking: boolean;
  takeout: boolean;
  delivery: boolean;
  reservations: boolean;
  live_music: boolean;
  pet_friendly: boolean;
  wheelchair_accessible: boolean;
  power_outlets: boolean;
}

export interface Cafe {
  id: string;
  place_id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  rating: number;
  user_ratings_total: number;
  price_level: PriceLevel;
  photos: CafePhoto[];
  hours: CafeHours | null;
  phone?: string;
  website?: string;
  reviews: CafeReview[];
  amenities: Partial<CafeAmenities>;
  types: string[];
  distance?: number; // in meters
  ai_score?: number; // AI relevance score 0-100
  ai_summary?: string; // AI-generated summary
  mood_tags?: Mood[];
  is_trending?: boolean;
  is_featured?: boolean;
  sentiment_score?: number; // -1 to 1
}

export interface CafeSearchParams {
  query?: string;
  location?: Coordinates;
  radius?: number; // in meters
  mood?: Mood;
  price_level?: PriceLevel[];
  min_rating?: number;
  open_now?: boolean;
  has_wifi?: boolean;
  has_outdoor?: boolean;
  page?: number;
  limit?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  favorites: string[]; // cafe place_ids
  recently_viewed: string[]; // cafe place_ids
  preferences: UserPreferences;
  created_at: Date;
}

export interface UserPreferences {
  default_mood?: Mood;
  default_radius?: number;
  preferred_price_levels?: PriceLevel[];
  location?: Coordinates;
  notifications?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  cafes?: Cafe[]; // AI can attach cafe recommendations
}

export interface AIRecommendation {
  cafes: Cafe[];
  reasoning: string;
  detected_mood: Mood;
  query_intent: string;
  confidence: number;
}

export interface SpinWheelItem {
  id: string;
  label: string;
  cafe: Cafe;
  color: string;
}

export interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface FilterState {
  priceLevel: PriceLevel[];
  minRating: number;
  maxDistance: number;
  openNow: boolean;
  hasWifi: boolean;
  hasOutdoor: boolean;
  mood: Mood;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: { photo_reference: string; width: number; height: number }[];
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  reviews?: {
    author_name: string;
    author_url: string;
    profile_photo_url?: string;
    rating: number;
    text: string;
    time: number;
    relative_time_description: string;
  }[];
  types?: string[];
  vicinity?: string;
}

export type ViewMode = 'map' | 'list' | 'split';

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'loading';
  message: string;
  duration?: number;
}
