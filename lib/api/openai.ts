import OpenAI from 'openai';
import type { Cafe, Mood, AIRecommendation, ChatMessage } from '@/types';

let _openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'placeholder' });
  }
  return _openai;
}

async function createCompletion(params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming): Promise<OpenAI.Chat.ChatCompletion> {
  return getClient().chat.completions.create(params) as Promise<OpenAI.Chat.ChatCompletion>;
}

// ─── Detect mood from query ───────────────────────────────────────────────────
export async function detectMoodAndIntent(query: string): Promise<{
  mood: Mood;
  intent: string;
  keywords: string[];
  price_preference?: 'cheap' | 'moderate' | 'expensive';
  features: string[];
}> {
  const completion = await createCompletion({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a cafe recommendation AI. Analyze the user's query and extract:
- mood: one of "romantic", "work", "chill", "social", "study", "date", "quick", "default"
- intent: brief description of what they want (1 sentence)
- keywords: array of relevant keywords for cafe search
- price_preference: "cheap", "moderate", or "expensive" if mentioned
- features: array of desired features (e.g., "wifi", "outdoor", "quiet", "cozy")

Respond with valid JSON only.`,
      },
      {
        role: 'user',
        content: query,
      },
    ],
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      mood: result.mood || 'default',
      intent: result.intent || query,
      keywords: result.keywords || [],
      price_preference: result.price_preference,
      features: result.features || [],
    };
  } catch {
    return {
      mood: 'default',
      intent: query,
      keywords: [query],
      features: [],
    };
  }
}

// ─── Rank cafes by AI ─────────────────────────────────────────────────────────
export async function rankCafesByQuery(
  cafes: Cafe[],
  query: string,
  mood: Mood
): Promise<AIRecommendation> {
  if (cafes.length === 0) {
    return {
      cafes: [],
      reasoning: 'No cafes found in the area.',
      detected_mood: mood,
      query_intent: query,
      confidence: 0,
    };
  }

  const cafeData = cafes.slice(0, 20).map((c, i) => ({
    index: i,
    name: c.name,
    rating: c.rating,
    price_level: c.price_level,
    distance: c.distance,
    open_now: c.hours?.open_now,
    amenities: c.amenities,
    types: c.types,
  }));

  const completion = await createCompletion({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an expert cafe curator. Given a list of cafes and a user query, rank the TOP 5 cafes by relevance.

Return JSON with:
- ranked_indices: array of up to 5 cafe indices (most relevant first)
- reasoning: brief explanation of why these cafes match (2-3 sentences)
- confidence: 0-100 score of how well these matches the query
- query_intent: what the user is really looking for`,
      },
      {
        role: 'user',
        content: `User query: "${query}" (Mood: ${mood})\n\nCafes:\n${JSON.stringify(cafeData, null, 2)}`,
      },
    ],
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const rankedCafes = (result.ranked_indices || [0, 1, 2, 3, 4])
      .filter((i: number) => i >= 0 && i < cafes.length)
      .map((i: number) => ({ ...cafes[i], ai_score: 100 - i * 10 }));

    return {
      cafes: rankedCafes,
      reasoning: result.reasoning || 'These cafes best match your query.',
      detected_mood: mood,
      query_intent: result.query_intent || query,
      confidence: result.confidence || 75,
    };
  } catch {
    return {
      cafes: cafes.slice(0, 5).map((c, i) => ({ ...c, ai_score: 100 - i * 10 })),
      reasoning: 'Here are the top-rated cafes near you.',
      detected_mood: mood,
      query_intent: query,
      confidence: 60,
    };
  }
}

// ─── Generate cafe AI summary ─────────────────────────────────────────────────
export async function generateCafeSummary(cafe: Cafe): Promise<string> {
  const reviewTexts = cafe.reviews
    .slice(0, 3)
    .map((r) => r.text)
    .join(' | ');

  const completion = await createCompletion({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    max_tokens: 100,
    messages: [
      {
        role: 'system',
        content:
          'Write a concise, appealing 2-sentence summary of a cafe based on its details. Be warm, descriptive, and honest. Focus on ambiance and what makes it special.',
      },
      {
        role: 'user',
        content: `Cafe: ${cafe.name}
Rating: ${cafe.rating}/5 (${cafe.user_ratings_total} reviews)
Price: ${'$'.repeat(cafe.price_level || 2)}
Recent reviews: ${reviewTexts || 'No reviews available'}`,
      },
    ],
  });

  return completion.choices[0].message.content || '';
}

// ─── Analyze review sentiment ─────────────────────────────────────────────────
export async function analyzeSentiment(reviews: string[]): Promise<{
  score: number; // -1 to 1
  summary: string;
  highlights: string[];
  concerns: string[];
}> {
  if (reviews.length === 0) {
    return { score: 0, summary: 'No reviews available.', highlights: [], concerns: [] };
  }

  const completion = await createCompletion({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Analyze the sentiment of these cafe reviews. Return JSON with:
- score: overall sentiment from -1 (very negative) to 1 (very positive)
- summary: one sentence overview of the overall sentiment
- highlights: array of up to 3 positive aspects mentioned
- concerns: array of up to 3 negative aspects mentioned`,
      },
      {
        role: 'user',
        content: reviews.join('\n\n---\n\n'),
      },
    ],
  });

  try {
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch {
    return { score: 0.5, summary: 'Mixed reviews.', highlights: [], concerns: [] };
  }
}

// ─── AI Chatbot ───────────────────────────────────────────────────────────────
export async function chatWithAI(
  messages: ChatMessage[],
  nearbyContext?: Cafe[]
): Promise<string> {
  const systemPrompt = `You are CafeBot, an enthusiastic and knowledgeable cafe finder AI assistant. You help users discover perfect cafes based on their mood, needs, and preferences.

Your personality:
- Warm, friendly, and genuinely excited about great coffee
- Knowledgeable about cafe culture, coffee types, and what makes a great work/social/romantic spot
- Concise but helpful — keep responses under 200 words

${
  nearbyContext && nearbyContext.length > 0
    ? `Nearby cafes available: ${nearbyContext
        .slice(0, 5)
        .map((c) => `${c.name} (${c.rating}★, ${c.address})`)
        .join(', ')}`
    : ''
}

When recommending cafes, mention specific names from the nearby list if available. Always end with a helpful follow-up question.`;

  const formattedMessages = messages.slice(-10).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const completion = await createCompletion({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 250,
    messages: [{ role: 'system', content: systemPrompt }, ...formattedMessages],
  });

  return completion.choices[0].message.content || "I'd love to help you find a cafe! What are you in the mood for?";
}
