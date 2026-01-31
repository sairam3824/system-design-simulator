/**
 * Redis Client using Upstash
 *
 * Provides a singleton Redis client for caching.
 * Falls back gracefully if Redis is not configured.
 */

import { Redis } from "@upstash/redis";

// Cache key prefixes for organization
export const CACHE_KEYS = {
  USER_ANALYTICS: "analytics:user:",
  LEADERBOARD: "leaderboard:",
  OLLAMA_HEALTH: "ollama:health",
  INTERVIEW_QUESTIONS: "questions:",
} as const;

// TTL values in seconds
export const CACHE_TTL = {
  USER_ANALYTICS: 5 * 60,      // 5 minutes
  LEADERBOARD: 60,             // 1 minute
  OLLAMA_HEALTH: 30,           // 30 seconds
  INTERVIEW_QUESTIONS: 60 * 60, // 1 hour
} as const;

// Check if Redis is configured
const isRedisConfigured = () => {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
};

// Create Redis client singleton
let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisClient;
}

// Helper to check if Redis is available
export function isRedisAvailable(): boolean {
  return isRedisConfigured();
}

export { Redis };
