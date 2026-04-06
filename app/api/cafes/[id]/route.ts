import { NextRequest, NextResponse } from 'next/server';
import { getPlaceDetails } from '@/lib/api/googlePlaces';
import { getCache, setCache, cacheKeys } from '@/lib/utils/cache';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import type { ApiResponse, Cafe } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const placeId = params.id;

  const cacheKey = cacheKeys.cafeDetails(placeId);
  const cached = getCache<Cafe>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<Cafe>>({ success: true, data: cached });
  }

  // Check demo data
  const demo = DEMO_CAFES.find((c) => c.place_id === placeId);
  if (demo && !process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json<ApiResponse<Cafe>>({ success: true, data: demo });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Cafe not found' },
      { status: 404 }
    );
  }

  try {
    const cafe = await getPlaceDetails(placeId);
    setCache(cacheKey, cafe, { ttl: 1000 * 60 * 30 }); // 30 min cache
    return NextResponse.json<ApiResponse<Cafe>>({ success: true, data: cafe });
  } catch (error) {
    console.error('Cafe details error:', error);
    if (demo) {
      return NextResponse.json<ApiResponse<Cafe>>({ success: true, data: demo });
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Failed to load cafe details' },
      { status: 500 }
    );
  }
}
