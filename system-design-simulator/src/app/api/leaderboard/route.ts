/**
 * Leaderboard API
 *
 * GET /api/leaderboard
 * Query params:
 *   - timeFrame: "week" | "month" | "all-time" (default: "all-time")
 *   - topic: string (optional)
 *   - difficulty: "easy" | "medium" | "hard" | "all" (default: "all")
 *   - limit: number (default: 50)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeaderboard, getLeaderboardTopics } from "@/lib/leaderboard";
import type { TimeFrame, Difficulty } from "@/types/leaderboard";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:leaderboard");
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const timeFrame = (searchParams.get("timeFrame") || "all-time") as TimeFrame;
    const topic = searchParams.get("topic") || undefined;
    const difficulty = (searchParams.get("difficulty") || "all") as Difficulty;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    // Validate timeFrame
    if (!["week", "month", "all-time"].includes(timeFrame)) {
      return NextResponse.json(
        { error: "Invalid timeFrame. Use: week, month, or all-time" },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (!["easy", "medium", "hard", "all"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Use: easy, medium, hard, or all" },
        { status: 400 }
      );
    }

    // Get leaderboard data
    const leaderboard = await getLeaderboard(
      { timeFrame, topic, difficulty },
      currentUserId,
      limit
    );

    // Get available topics for filtering
    const availableTopics = await getLeaderboardTopics();

    return NextResponse.json({
      ...leaderboard,
      availableTopics,
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
