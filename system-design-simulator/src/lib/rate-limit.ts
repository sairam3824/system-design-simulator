/**
 * Rate Limiting Utility
 *
 * Sliding window rate limiter using Upstash Redis.
 * Falls back to in-memory storage when Redis is not configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { getRedisClient, isRedisAvailable } from "./redis";

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  window: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when the window resets
}

// Predefined rate limit tiers
export const RATE_LIMITS = {
  /** Auth routes (login, register) - strict to prevent brute force */
  AUTH: { limit: 5, window: 60 },
  /** Password change - very strict */
  PASSWORD: { limit: 3, window: 60 },
  /** Resource creation (interviews, challenges) - moderate */
  CREATE: { limit: 10, window: 60 },
  /** Chat/interaction endpoints - higher limit */
  CHAT: { limit: 30, window: 60 },
  /** Code submission - moderate */
  SUBMIT: { limit: 20, window: 60 },
  /** Read/list endpoints - generous */
  READ: { limit: 60, window: 60 },
  /** File upload - strict */
  UPLOAD: { limit: 5, window: 60 },
  /** AI/LLM endpoints (expensive) - moderate */
  AI: { limit: 10, window: 60 },
} as const;

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore) {
    if (value.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

/**
 * Extract client identifier from request.
 * Uses IP address for unauthenticated requests.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "127.0.0.1";
}

/**
 * Check rate limit using Redis sliding window.
 */
async function checkRedisRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return { success: true, limit: config.limit, remaining: config.limit, reset: 0 };
  }

  const now = Date.now();
  const windowMs = config.window * 1000;
  const windowStart = now - windowMs;

  // Use a sorted set for sliding window
  const redisKey = `ratelimit:${key}`;

  // Pipeline: remove old entries, add current, count, set expiry
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(redisKey, 0, windowStart);
  pipeline.zadd(redisKey, { score: now, member: `${now}:${Math.random()}` });
  pipeline.zcard(redisKey);
  pipeline.expire(redisKey, config.window);

  const results = await pipeline.exec();
  const count = (results[2] as number) || 0;

  const reset = Math.ceil((now + windowMs) / 1000);
  const remaining = Math.max(0, config.limit - count);
  const success = count <= config.limit;

  return { success, limit: config.limit, remaining, reset };
}

/**
 * Check rate limit using in-memory store (fallback).
 */
function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.window * 1000;
  const storeKey = `ratelimit:${key}`;

  const entry = memoryStore.get(storeKey);

  if (!entry || entry.resetAt <= now) {
    // New window
    memoryStore.set(storeKey, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  entry.count++;
  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining,
    reset: Math.ceil(entry.resetAt / 1000),
  };
}

/**
 * Core rate limit check. Returns result indicating if request is allowed.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (isRedisAvailable()) {
    try {
      return await checkRedisRateLimit(identifier, config);
    } catch (error) {
      console.error("Redis rate limit error, falling back to memory:", error);
      return checkMemoryRateLimit(identifier, config);
    }
  }
  return checkMemoryRateLimit(identifier, config);
}

/**
 * Apply rate limiting to an API route handler.
 * Returns a 429 response if the limit is exceeded, or null if allowed.
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @param keyPrefix - Prefix for the rate limit key (e.g., "api:register")
 * @param userId - Optional user ID for user-based limiting (falls back to IP)
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix: string,
  userId?: string
): Promise<NextResponse | null> {
  const identifier = userId || getClientIp(request);
  const key = `${keyPrefix}:${identifier}`;

  const result = await checkRateLimit(key, config);

  if (!result.success) {
    const retryAfter = Math.max(1, result.reset - Math.ceil(Date.now() / 1000));
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  return null;
}

/**
 * Add rate limit headers to a successful response.
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.reset));
  return response;
}
