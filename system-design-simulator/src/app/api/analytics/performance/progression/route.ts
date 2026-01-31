/**
 * Performance Progression API
 *
 * GET /api/analytics/performance/progression
 * Returns score progression over time, optionally filtered by dimension.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getScoreProgression, calculateTrend } from "@/lib/analytics/performance-analytics";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:analytics:progression", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get("dimension") || undefined;
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const dataPoints = await getScoreProgression(session.user.id, dimension, limit);

    // Calculate trend from the data points
    const scores = dataPoints.map((dp) => dp.overallScore);
    const trend = calculateTrend(scores);

    return NextResponse.json({
      success: true,
      dimension: dimension || "overall",
      dataPoints,
      trend,
      count: dataPoints.length,
    });
  } catch (error) {
    console.error("Performance progression error:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance progression" },
      { status: 500 }
    );
  }
}
