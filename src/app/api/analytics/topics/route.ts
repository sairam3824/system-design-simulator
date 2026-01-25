/**
 * Topic Analytics API
 *
 * GET /api/analytics/topics
 * Returns topic-wise performance analysis.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTopicWiseAnalysis } from "@/lib/analytics/topic-analytics";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topicStats = await getTopicWiseAnalysis(session.user.id);

    return NextResponse.json({
      success: true,
      topicStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Topic analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic analytics" },
      { status: 500 }
    );
  }
}
