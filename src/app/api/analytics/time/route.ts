/**
 * Time Analytics API
 *
 * GET /api/analytics/time
 * Returns time allocation analysis across interview phases.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserTimePatterns, analyzeInterviewTime } from "@/lib/analytics/time-analytics";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // If specific interview requested, return that analysis
    if (interviewId) {
      const analysis = await analyzeInterviewTime(interviewId);

      if (!analysis) {
        return NextResponse.json(
          { error: "Interview not found or no time data available" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "single",
        interviewId,
        analysis,
      });
    }

    // Otherwise, return aggregated patterns
    const patterns = await getUserTimePatterns(session.user.id, limit);

    return NextResponse.json({
      success: true,
      type: "aggregate",
      patterns,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Time analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch time analytics" },
      { status: 500 }
    );
  }
}
