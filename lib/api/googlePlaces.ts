import axios from 'axios';
import type { Cafe, CafePhoto, CafeReview, GooglePlaceResult } from '@/types';

const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';
const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

// ─── Photo URL helper ─────────────────────────────────────────────────────────
export function getPhotoUrl(photoReference: string, maxWidth = 800): string {
  return `${PLACES_API_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

// ─── Transform Google Place → Cafe ───────────────────────────────────────────
export function transformPlace(place: GooglePlaceResult, userLat?: number, userLng?: number): Cafe {
  const photos: CafePhoto[] = (place.photos || []).slice(0, 6).map((p) => ({
    url: getPhotoUrl(p.photo_reference),
    width: p.width,
    height: p.height,
    photoReference: p.photo_reference,
  }));

  const reviews: CafeReview[] = (place.reviews || []).map((r, i) => ({
    id: `${place.place_id}_review_${i}`,
    author_name: r.author_name,
    author_photo: r.profile_photo_url,
    rating: r.rating,
    text: r.text,
    time: r.time,
    relative_time_description: r.relative_time_description,
  }));

  // Calculate distance if user coords provided
  let distance: number | undefined;
  if (userLat !== undefined && userLng !== undefined) {
    distance = haversineDistance(
      userLat,
      userLng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );
  }

  // Infer amenities from types/name
  const types = place.types || [];
  const nameLC = place.name.toLowerCase();

  const amenities: Cafe['amenities'] = {
    wifi: types.includes('wifi') || nameLC.includes('wifi') || nameLC.includes('co-work'),
    outdoor_seating:
      types.includes('outdoors') || nameLC.includes('garden') || nameLC.includes('terrace'),
    takeout: types.includes('meal_takeaway') || types.includes('takeout'),
    delivery: types.includes('meal_delivery'),
  };

  return {
    id: place.place_id,
    place_id: place.place_id,
    name: place.name,
    address: place.formatted_address || place.vicinity || '',
    coordinates: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    rating: place.rating || 0,
    user_ratings_total: place.user_ratings_total || 0,
    price_level: (place.price_level as Cafe['price_level']) ?? 2,
    photos,
    hours: place.opening_hours
      ? {
          open_now: place.opening_hours.open_now,
          weekday_text: place.opening_hours.weekday_text,
        }
      : null,
    phone: place.formatted_phone_number,
    website: place.website,
    reviews,
    amenities,
    types,
    distance,
  };
}

// ─── Nearby Search ───────────────────────────────────────────────────────────
export async function searchNearbyCafes(
  lat: number,
  lng: number,
  radius = 1500,
  keyword?: string
): Promise<Cafe[]> {
  const params: Record<string, string | number> = {
    location: `${lat},${lng}`,
    radius,
    type: 'cafe',
    key: API_KEY,
  };

  if (keyword) params.keyword = keyword;

  const response = await axios.get(`${PLACES_API_BASE}/nearbysearch/json`, { params });

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  const places: GooglePlaceResult[] = response.data.results || [];
  return places.map((p) => transformPlace(p, lat, lng));
}

// ─── Text Search ─────────────────────────────────────────────────────────────
export async function textSearchCafes(
  query: string,
  lat?: number,
  lng?: number
): Promise<Cafe[]> {
  const params: Record<string, string> = {
    query: `${query} cafe`,
    type: 'cafe',
    key: API_KEY,
  };

  if (lat !== undefined && lng !== undefined) {
    params.location = `${lat},${lng}`;
    params.radius = '5000';
  }

  const response = await axios.get(`${PLACES_API_BASE}/textsearch/json`, { params });

  if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  const places: GooglePlaceResult[] = response.data.results || [];
  return places.map((p) => transformPlace(p, lat, lng));
}

// ─── Place Details ────────────────────────────────────────────────────────────
export async function getPlaceDetails(placeId: string, userLat?: number, userLng?: number): Promise<Cafe> {
  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'geometry',
    'rating',
    'user_ratings_total',
    'price_level',
    'photos',
    'opening_hours',
    'formatted_phone_number',
    'website',
    'reviews',
    'types',
  ].join(',');

  const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
    params: { place_id: placeId, fields, key: API_KEY },
  });

  if (response.data.status !== 'OK') {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  return transformPlace(response.data.result, userLat, userLng);
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────
export async function autocompleteLocation(input: string): Promise<
  { description: string; place_id: string }[]
> {
  const response = await axios.get(`${PLACES_API_BASE}/autocomplete/json`, {
    params: {
      input,
      types: 'geocode',
      key: API_KEY,
    },
  });

  return (response.data.predictions || []).map((p: { description: string; place_id: string }) => ({
    description: p.description,
    place_id: p.place_id,
  }));
}

// ─── Get coordinates from place_id ───────────────────────────────────────────
export async function geocodePlaceId(placeId: string): Promise<{ lat: number; lng: number }> {
  const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
    params: {
      place_id: placeId,
      fields: 'geometry',
      key: API_KEY,
    },
  });

  const loc = response.data.result?.geometry?.location;
  if (!loc) throw new Error('Could not geocode place');
  return { lat: loc.lat, lng: loc.lng };
}

// ─── Haversine distance formula ───────────────────────────────────────────────
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// ─── Format distance for display ─────────────────────────────────────────────
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
