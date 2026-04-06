import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyCafes } from '@/lib/api/googlePlaces';
import { getCache, setCache, cacheKeys } from '@/lib/utils/cache';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import type { ApiResponse, Cafe } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseInt(searchParams.get('radius') || '1500');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Missing or invalid lat/lng parameters' },
      { status: 400 }
    );
  }

  // Check cache
  const cacheKey = cacheKeys.nearbyCafes(lat, lng, radius);
  const cached = getCache<Cafe[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: cached });
  }

  // If no API key, return demo data
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    const demo = DEMO_CAFES.map((c) => ({
      ...c,
      distance: Math.floor(Math.random() * 1000) + 200,
    }));
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: demo });
  }

  try {
    const cafes = await searchNearbyCafes(lat, lng, radius);
    setCache(cacheKey, cafes, { ttl: 1000 * 60 * 5 }); // 5 min cache
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: cafes });
  } catch (error) {
    console.error('Nearby cafes error:', error);
    // Fallback to demo
    return NextResponse.json<ApiResponse<Cafe[]>>({ success: true, data: DEMO_CAFES });
  }
}
