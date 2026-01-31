/**
 * Performance Analytics API
 *
 * GET /api/analytics/performance
 * Returns comprehensive performance metrics for the authenticated user.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculatePerformanceMetrics } from "@/lib/analytics/performance-analytics";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:analytics:performance", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const metrics = await calculatePerformanceMetrics(session.user.id, limit);

    return NextResponse.json({
      success: true,
      metrics,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Performance analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance analytics" },
      { status: 500 }
    );
  }
}
