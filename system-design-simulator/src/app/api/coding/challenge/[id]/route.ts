import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/coding/challenge/[id] - Get challenge details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:coding:challenge:get", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const challenge = await prisma.codingChallenge.findUnique({
      where: { id },
      include: {
        submissions: {
          orderBy: { submittedAt: "desc" },
          take: 10,
        },
        score: true,
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate remaining time if in progress
    let remainingTime = null;
    if (challenge.status === "in_progress" && challenge.startedAt) {
      const elapsedMs = Date.now() - challenge.startedAt.getTime();
      const timeLimitMs = challenge.timeLimit * 60 * 1000;
      remainingTime = Math.max(0, timeLimitMs - elapsedMs);
    }

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        company: challenge.company,
        language: challenge.language,
        timeLimit: challenge.timeLimit,
        status: challenge.status,
        startedAt: challenge.startedAt,
        endedAt: challenge.endedAt,
        starterCode: challenge.starterCode,
        finalCode: challenge.finalCode,
        visibleTests: JSON.parse(challenge.visibleTests),
        remainingTime,
        submissions: challenge.submissions.map((s) => ({
          id: s.id,
          submittedAt: s.submittedAt,
          isValid: s.isValid,
          errorMessage: s.errorMessage,
          testResults: s.testResults ? JSON.parse(s.testResults) : null,
        })),
        score: challenge.score
          ? {
              correctness: challenge.score.correctness,
              efficiency: challenge.score.efficiency,
              codeQuality: challenge.score.codeQuality,
              edgeCases: challenge.score.edgeCases,
              overallScore: challenge.score.overallScore,
              passStatus: challenge.score.passStatus,
              feedback: challenge.score.feedback,
              suggestedApproach: challenge.score.suggestedApproach,
              complexityAnalysis: challenge.score.complexityAnalysis,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Challenge fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/coding/challenge/[id] - Update challenge (start timer)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.SUBMIT, "api:coding:challenge:update", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const { action, code } = body;

    const challenge = await prisma.codingChallenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "start") {
      // Start the challenge timer
      if (challenge.status !== "pending") {
        return NextResponse.json(
          { error: "Challenge already started" },
          { status: 400 }
        );
      }

      const updatedChallenge = await prisma.codingChallenge.update({
        where: { id },
        data: {
          status: "in_progress",
          startedAt: new Date(),
        },
      });

      return NextResponse.json({
        challenge: {
          id: updatedChallenge.id,
          status: updatedChallenge.status,
          startedAt: updatedChallenge.startedAt,
          timeLimit: updatedChallenge.timeLimit,
        },
      });
    } else if (action === "save" && code !== undefined) {
      // Save code progress (auto-save)
      await prisma.codingChallenge.update({
        where: { id },
        data: { finalCode: code },
      });

      return NextResponse.json({ saved: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Challenge update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
