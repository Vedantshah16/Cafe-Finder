import { NextRequest, NextResponse } from 'next/server';
import { autocompleteLocation } from '@/lib/api/googlePlaces';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get('input') || '';

  if (!input || input.length < 2) {
    return NextResponse.json<ApiResponse<[]>>({ success: true, data: [] });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json<ApiResponse<[]>>({ success: true, data: [] });
  }

  try {
    const suggestions = await autocompleteLocation(input);
    return NextResponse.json<ApiResponse<typeof suggestions>>({ success: true, data: suggestions });
  } catch {
    return NextResponse.json<ApiResponse<[]>>({ success: true, data: [] });
  }
}
