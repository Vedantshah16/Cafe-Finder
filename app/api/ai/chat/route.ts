import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/api/openai';
import { searchNearbyCafes } from '@/lib/api/googlePlaces';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import type { ApiResponse, ChatMessage, Cafe } from '@/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, location, nearbyContext } = body as {
    messages: ChatMessage[];
    location?: { lat: number; lng: number };
    nearbyContext?: Cafe[];
  };

  if (!messages || messages.length === 0) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Messages are required' },
      { status: 400 }
    );
  }

  try {
    let contextCafes: Cafe[] = nearbyContext || DEMO_CAFES.slice(0, 5);

    // Fetch real nearby cafes if location provided and API available
    if (
      process.env.GOOGLE_PLACES_API_KEY &&
      location?.lat &&
      location?.lng &&
      (!nearbyContext || nearbyContext.length === 0)
    ) {
      try {
        contextCafes = await searchNearbyCafes(location.lat, location.lng, 1500);
      } catch {
        contextCafes = DEMO_CAFES.slice(0, 5);
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      // Return a simple mock response
      const lastMsg = messages[messages.length - 1];
      const response = generateMockResponse(lastMsg.content, contextCafes);
      return NextResponse.json<ApiResponse<{ message: string; cafes: Cafe[] }>>({
        success: true,
        data: { message: response, cafes: contextCafes.slice(0, 2) },
      });
    }

    const message = await chatWithAI(messages, contextCafes);

    // Check if the response mentions any cafes by name
    const mentionedCafes = contextCafes.filter((c) =>
      message.toLowerCase().includes(c.name.toLowerCase())
    );

    return NextResponse.json<ApiResponse<{ message: string; cafes: Cafe[] }>>({
      success: true,
      data: { message, cafes: mentionedCafes.slice(0, 2) },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json<ApiResponse<{ message: string; cafes: Cafe[] }>>({
      success: true,
      data: {
        message: "I'm having a bit of trouble right now ☕ Try exploring the map or searching directly!",
        cafes: [],
      },
    });
  }
}

function generateMockResponse(userMessage: string, cafes: Cafe[]): string {
  const msg = userMessage.toLowerCase();
  const cafe = cafes[0];
  const cafeName = cafe?.name || 'The Brew Lab';

  if (msg.includes('romantic') || msg.includes('date')) {
    return `For a romantic date, I'd suggest ${cafeName} — it has intimate lighting and a cozy atmosphere perfect for two. Would you like me to find more options with outdoor seating or a specific ambiance? 💕`;
  }
  if (msg.includes('work') || msg.includes('wifi') || msg.includes('laptop')) {
    return `For working, ${cafeName} would be ideal with reliable WiFi and plenty of power outlets. Many regulars spend entire days there! Shall I filter by noise level too? 💻`;
  }
  if (msg.includes('cheap') || msg.includes('budget') || msg.includes('affordable')) {
    return `On a budget? ${cafeName} offers great value — quality espresso without breaking the bank. The average spend is around $5-8 per visit. Want more budget-friendly options? ☕`;
  }
  return `Based on your request, I'd recommend checking out ${cafeName} nearby — it's highly rated and matches what you're looking for. Shall I show you more options or tell you about this one? 😊`;
}
