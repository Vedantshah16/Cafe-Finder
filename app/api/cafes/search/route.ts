import { NextRequest, NextResponse } from 'next/server';
import { textSearchCafes } from '@/lib/api/googlePlaces';
import { getCache, setCache, cacheKeys } from '@/lib/utils/cache';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import type { ApiResponse, Cafe } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('query') || searchParams.get('q') || '';
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (!query) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Missing query parameter' },
      { status: 400 }
    );
  }

  const cacheKey = cacheKeys.searchResults(query, isNaN(lat) ? undefined : lat, isNaN(lng) ? undefined : lng);
  const cached = getCache<Cafe[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: cached });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    const ql = query.toLowerCase();
    const filtered = DEMO_CAFES.filter(
      (c) =>
        c.name.toLowerCase().includes(ql) ||
        c.ai_summary?.toLowerCase().includes(ql) ||
        c.mood_tags?.some((t) => t.includes(ql))
    );
    return NextResponse.json<ApiResponse<Cafe[]>>({
      success: true,
      data: filtered.length > 0 ? filtered : DEMO_CAFES,
    });
  }

  try {
    const cafes = await textSearchCafes(
      query,
      isNaN(lat) ? undefined : lat,
      isNaN(lng) ? undefined : lng
    );
    setCache(cacheKey, cafes, { ttl: 1000 * 60 * 5 });
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: cafes });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: DEMO_CAFES });
  }
}
