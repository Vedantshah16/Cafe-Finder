import { LRUCache } from 'lru-cache';

interface CacheOptions {
  ttl?: number; // time-to-live in milliseconds
  maxSize?: number;
}

// ─── In-memory LRU cache for API responses ────────────────────────────────────
const cache = new LRUCache<string, object>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes default TTL
});

export function getCache<T extends object>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCache<T extends object>(key: string, value: T, options?: CacheOptions): void {
  cache.set(key, value, { ttl: options?.ttl });
}

export function deleteCache(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}

// ─── Cache key generators ─────────────────────────────────────────────────────
export const cacheKeys = {
  nearbyCafes: (lat: number, lng: number, radius: number) =>
    `nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}`,
  cafeDetails: (placeId: string) => `cafe:${placeId}`,
  searchResults: (query: string, lat?: number, lng?: number) =>
    `search:${query}:${lat?.toFixed(3) || ''}:${lng?.toFixed(3) || ''}`,
  trending: (lat: number, lng: number) => `trending:${lat.toFixed(2)}:${lng.toFixed(2)}`,
  aiRecommend: (query: string) => `ai:${query.toLowerCase().trim()}`,
};

// ─── Rate limiting (simple in-memory) ─────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}
