/**
 * Cache Utilities
 *
 * Provides helpers for caching with Redis.
 * All operations gracefully fall back to direct execution if Redis is unavailable.
 */

import { getRedisClient, isRedisAvailable, CACHE_TTL } from "./redis";

/**
 * Get a cached value by key
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const redis = getRedisClient();
    if (!redis) return null;

    const value = await redis.get(key);
    return value as T | null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set a cached value with TTL
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = CACHE_TTL.USER_ANALYTICS
): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
}

/**
 * Delete a cached value
 */
export async function cacheDelete(key: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.del(key);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
}

/**
 * Delete multiple cached values by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<boolean> {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const redis = getRedisClient();
    if (!redis) return false;

    // Upstash Redis supports SCAN for pattern matching
    let cursor = 0;
    do {
      const [newCursor, keys] = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = parseInt(newCursor as string, 10);

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);

    return true;
  } catch (error) {
    console.error("Cache delete pattern error:", error);
    return false;
  }
}

/**
 * Get or fetch pattern - returns cached value or fetches and caches it
 */
export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.USER_ANALYTICS
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    // Parse if it's a string (JSON)
    if (typeof cached === "string") {
      try {
        return JSON.parse(cached) as T;
      } catch {
        return cached as T;
      }
    }
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Cache the result
  await cacheSet(key, fresh, ttlSeconds);

  return fresh;
}

/**
 * Invalidate user analytics cache
 */
export async function invalidateUserAnalytics(userId: string): Promise<void> {
  await cacheDeletePattern(`analytics:user:${userId}*`);
}

/**
 * Invalidate leaderboard cache
 */
export async function invalidateLeaderboard(): Promise<void> {
  await cacheDeletePattern("leaderboard:*");
}
