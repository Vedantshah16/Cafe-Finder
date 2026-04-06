import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyCafes } from '@/lib/api/googlePlaces';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import { getCache, setCache, cacheKeys } from '@/lib/utils/cache';
import type { ApiResponse, Cafe } from '@/types';

// Default to NYC if no location provided
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.006;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || String(DEFAULT_LAT));
  const lng = parseFloat(searchParams.get('lng') || String(DEFAULT_LNG));

  const cacheKey = cacheKeys.trending(lat, lng);
  const cached = getCache<Cafe[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: cached });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    const trending = DEMO_CAFES.filter((c) => c.is_trending || c.is_featured || c.rating >= 4.7);
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: trending });
  }

  try {
    const cafes = await searchNearbyCafes(lat, lng, 3000);
    // Sort by rating × review count as a trending score
    const trending = cafes
      .sort((a, b) => b.rating * Math.log(b.user_ratings_total + 1) - a.rating * Math.log(a.user_ratings_total + 1))
      .slice(0, 6)
      .map((c) => ({ ...c, is_trending: true }));

    setCache(cacheKey, trending, { ttl: 1000 * 60 * 15 }); // 15 min
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: trending });
  } catch (error) {
    console.error('Trending error:', error);
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: DEMO_CAFES });
  }
}
