/**
 * Leaderboard Service
 *
 * Provides leaderboard data with filtering, ranking, and caching.
 */

import { prisma } from "@/lib/prisma";
import { getOrFetch } from "@/lib/cache";
import { CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import type {
  LeaderboardEntry,
  LeaderboardFilters,
  LeaderboardResponse,
  TimeFrame,
} from "@/types/leaderboard";

/**
 * Get the date range for a time frame
 */
function getDateRange(timeFrame: TimeFrame): Date | null {
  const now = new Date();
  switch (timeFrame) {
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "all-time":
      return null;
  }
}

/**
 * Generate an anonymous display name from user ID
 */
function getAnonymousName(userId: string): string {
  // Use last 4 characters of the user ID for uniqueness
  const suffix = userId.slice(-4).toUpperCase();
  return `User #${suffix}`;
}

/**
 * Calculate trend based on recent performance
 */
function calculateTrend(
  recentScores: number[]
): "up" | "down" | "stable" {
  if (recentScores.length < 2) return "stable";

  // Split into two halves
  const mid = Math.floor(recentScores.length / 2);
  const firstHalf = recentScores.slice(0, mid);
  const secondHalf = recentScores.slice(mid);

  const firstAvg =
    firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  if (diff > 0.2) return "up";
  if (diff < -0.2) return "down";
  return "stable";
}

/**
 * Get leaderboard data with filters
 */
export async function getLeaderboard(
  filters: LeaderboardFilters,
  currentUserId?: string,
  limit: number = 50
): Promise<LeaderboardResponse> {
  const cacheKey = `${CACHE_KEYS.LEADERBOARD}${filters.timeFrame}:${filters.topic || "all"}:${filters.difficulty || "all"}`;

  const fetchLeaderboard = async (): Promise<LeaderboardResponse> => {
    const dateFrom = getDateRange(filters.timeFrame);

    // Build where clause for interviews
    const whereClause: Record<string, unknown> = {
      status: "completed",
    };

    if (dateFrom) {
      whereClause.endedAt = { gte: dateFrom };
    }

    if (filters.topic) {
      whereClause.topic = filters.topic;
    }

    if (filters.difficulty && filters.difficulty !== "all") {
      whereClause.difficulty = filters.difficulty;
    }

    // Get all users with completed interviews matching filters
    const usersWithStats = await prisma.user.findMany({
      where: {
        interviews: {
          some: whereClause,
        },
      },
      select: {
        id: true,
        name: true,
        interviews: {
          where: whereClause,
          select: {
            score: {
              select: {
                overallScore: true,
                passStatus: true,
              },
            },
            endedAt: true,
          },
          orderBy: {
            endedAt: "desc",
          },
        },
      },
    });

    // Calculate stats for each user
    const userStats = usersWithStats
      .map((user) => {
        const scores = user.interviews
          .filter((i) => i.score)
          .map((i) => i.score!.overallScore);

        if (scores.length === 0) return null;

        const avgScore =
          scores.reduce((a, b) => a + b, 0) / scores.length;
        const passCount = user.interviews.filter(
          (i) => i.score?.passStatus
        ).length;
        const passRate = (passCount / scores.length) * 100;
        const trend = calculateTrend(scores);

        return {
          userId: user.id,
          displayName: user.name || getAnonymousName(user.id),
          avgOverallScore: Math.round(avgScore * 100) / 100,
          completedInterviews: scores.length,
          passRate: Math.round(passRate),
          trend,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // Sort by average score (descending), then by completed interviews for ties
    userStats.sort((a, b) => {
      if (b.avgOverallScore !== a.avgOverallScore) {
        return b.avgOverallScore - a.avgOverallScore;
      }
      return b.completedInterviews - a.completedInterviews;
    });

    // Assign ranks (handling ties)
    let currentRank = 1;
    let currentScore = -1;
    const entries: LeaderboardEntry[] = userStats
      .slice(0, limit)
      .map((stat, index) => {
        // Update rank only if score changed
        if (stat.avgOverallScore !== currentScore) {
          currentRank = index + 1;
          currentScore = stat.avgOverallScore;
        }

        return {
          rank: currentRank,
          userId: stat.userId,
          displayName: stat.displayName,
          avgOverallScore: stat.avgOverallScore,
          completedInterviews: stat.completedInterviews,
          passRate: stat.passRate,
          trend: stat.trend,
          isCurrentUser: stat.userId === currentUserId,
        };
      });

    // Find current user's rank if not in top N
    let currentUserRank: number | undefined;
    if (currentUserId) {
      const currentUserIndex = userStats.findIndex(
        (s) => s.userId === currentUserId
      );
      if (currentUserIndex !== -1) {
        currentUserRank = currentUserIndex + 1;
      }
    }

    return {
      entries,
      totalUsers: userStats.length,
      currentUserRank,
      filters,
    };
  };

  return getOrFetch(cacheKey, fetchLeaderboard, CACHE_TTL.LEADERBOARD);
}

/**
 * Get available topics for filtering
 */
export async function getLeaderboardTopics(): Promise<string[]> {
  const topics = await prisma.interview.findMany({
    where: {
      status: "completed",
    },
    select: {
      topic: true,
    },
    distinct: ["topic"],
  });

  return topics.map((t) => t.topic);
}
