import { NextRequest, NextResponse } from 'next/server';
import { detectMoodAndIntent, rankCafesByQuery } from '@/lib/api/openai';
import { searchNearbyCafes, textSearchCafes } from '@/lib/api/googlePlaces';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import type { ApiResponse, AIRecommendation, Mood } from '@/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query, location } = body;

  if (!query) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Query is required' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Detect mood and intent using OpenAI
    let moodData: { mood: Mood; intent: string; keywords: string[]; features: string[] } = { mood: 'default' as Mood, intent: query, keywords: [query], features: [] };
    if (process.env.OPENAI_API_KEY) {
      moodData = await detectMoodAndIntent(query);
    }

    // Step 2: Fetch cafes
    let cafes = DEMO_CAFES;
    if (process.env.GOOGLE_PLACES_API_KEY && location?.lat && location?.lng) {
      const searchQuery = [...moodData.keywords, ...moodData.features].join(' ');
      cafes = await searchNearbyCafes(location.lat, location.lng, 2000, searchQuery);
      if (cafes.length < 3) {
        cafes = await textSearchCafes(query, location.lat, location.lng);
      }
    }

    // Step 3: AI rank
    let recommendation: AIRecommendation;
    if (process.env.OPENAI_API_KEY && cafes.length > 0) {
      recommendation = await rankCafesByQuery(cafes, query, moodData.mood as AIRecommendation['detected_mood']);
    } else {
      recommendation = {
        cafes: cafes.slice(0, 5),
        reasoning: `Here are the top cafes matching "${query}".`,
        detected_mood: moodData.mood as AIRecommendation['detected_mood'],
        query_intent: moodData.intent,
        confidence: 70,
      };
    }

    return NextResponse.json<ApiResponse<AIRecommendation>>({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('AI recommend error:', error);
    return NextResponse.json<ApiResponse<AIRecommendation>>({
      success: true,
      data: {
        cafes: DEMO_CAFES.slice(0, 5),
        reasoning: 'Here are some great cafes for you.',
        detected_mood: 'default',
        query_intent: query,
        confidence: 60,
      },
    });
  }
}
