/**
 * Interview Replay API
 *
 * GET /api/interview/[id]/replay
 * Returns formatted interview transcript with phase markers for replay.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInterviewReplay } from "@/lib/replay-formatter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user owns this interview
    const interview = await prisma.interview.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get replay data
    const replay = await getInterviewReplay(id);

    if (!replay) {
      return NextResponse.json({ error: "Failed to generate replay" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      replay,
    });
  } catch (error) {
    console.error("Interview replay error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview replay" },
      { status: 500 }
    );
  }
}
