module.exports = [
"[project]/Documents/Git/system-design/system-design-simulator/src/lib/cache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cacheDelete",
    ()=>cacheDelete,
    "cacheDeletePattern",
    ()=>cacheDeletePattern,
    "cacheGet",
    ()=>cacheGet,
    "cacheSet",
    ()=>cacheSet,
    "getOrFetch",
    ()=>getOrFetch,
    "invalidateLeaderboard",
    ()=>invalidateLeaderboard,
    "invalidateUserAnalytics",
    ()=>invalidateUserAnalytics
]);
/**
 * Cache Utilities
 *
 * Provides helpers for caching with Redis.
 * All operations gracefully fall back to direct execution if Redis is unavailable.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/Git/system-design/system-design-simulator/src/lib/redis.ts [app-route] (ecmascript) <locals>");
;
async function cacheGet(key) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRedisAvailable"])()) {
        return null;
    }
    try {
        const redis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRedisClient"])();
        if (!redis) return null;
        const value = await redis.get(key);
        return value;
    } catch (error) {
        console.error("Cache get error:", error);
        return null;
    }
}
async function cacheSet(key, value, ttlSeconds = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CACHE_TTL"].USER_ANALYTICS) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRedisAvailable"])()) {
        return false;
    }
    try {
        const redis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRedisClient"])();
        if (!redis) return false;
        await redis.set(key, JSON.stringify(value), {
            ex: ttlSeconds
        });
        return true;
    } catch (error) {
        console.error("Cache set error:", error);
        return false;
    }
}
async function cacheDelete(key) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRedisAvailable"])()) {
        return false;
    }
    try {
        const redis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRedisClient"])();
        if (!redis) return false;
        await redis.del(key);
        return true;
    } catch (error) {
        console.error("Cache delete error:", error);
        return false;
    }
}
async function cacheDeletePattern(pattern) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isRedisAvailable"])()) {
        return false;
    }
    try {
        const redis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRedisClient"])();
        if (!redis) return false;
        // Upstash Redis supports SCAN for pattern matching
        let cursor = 0;
        do {
            const [newCursor, keys] = await redis.scan(cursor, {
                match: pattern,
                count: 100
            });
            cursor = parseInt(newCursor, 10);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }while (cursor !== 0)
        return true;
    } catch (error) {
        console.error("Cache delete pattern error:", error);
        return false;
    }
}
async function getOrFetch(key, fetcher, ttlSeconds = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Git$2f$system$2d$design$2f$system$2d$design$2d$simulator$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CACHE_TTL"].USER_ANALYTICS) {
    // Try to get from cache first
    const cached = await cacheGet(key);
    if (cached !== null) {
        // Parse if it's a string (JSON)
        if (typeof cached === "string") {
            try {
                return JSON.parse(cached);
            } catch  {
                return cached;
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
async function invalidateUserAnalytics(userId) {
    await cacheDeletePattern(`analytics:user:${userId}*`);
}
async function invalidateLeaderboard() {
    await cacheDeletePattern("leaderboard:*");
}
}),
];

//# sourceMappingURL=Documents_Git_system-design_system-design-simulator_src_lib_cache_ts_4de9f4ae._.js.map