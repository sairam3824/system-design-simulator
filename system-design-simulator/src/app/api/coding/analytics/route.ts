import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// GET /api/coding/analytics - Get user's coding challenge statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:coding:analytics", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Get all completed challenges with scores
    const challenges = await prisma.codingChallenge.findMany({
      where: {
        userId: session.user.id,
        status: "completed",
      },
      include: { score: true },
      orderBy: { endedAt: "desc" },
    });

    // Calculate aggregate statistics
    const totalChallenges = challenges.length;
    const passedChallenges = challenges.filter((c) => c.score?.passStatus).length;
    const passRate = totalChallenges > 0 ? (passedChallenges / totalChallenges) * 100 : 0;

    // Calculate average scores
    const scoresWithValues = challenges.filter((c) => c.score);
    const avgOverallScore =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((acc, c) => acc + (c.score?.overallScore || 0), 0) /
          scoresWithValues.length
        : 0;

    const avgCorrectness =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((acc, c) => acc + (c.score?.correctness || 0), 0) /
          scoresWithValues.length
        : 0;

    const avgEfficiency =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((acc, c) => acc + (c.score?.efficiency || 0), 0) /
          scoresWithValues.length
        : 0;

    const avgCodeQuality =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((acc, c) => acc + (c.score?.codeQuality || 0), 0) /
          scoresWithValues.length
        : 0;

    const avgEdgeCases =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((acc, c) => acc + (c.score?.edgeCases || 0), 0) /
          scoresWithValues.length
        : 0;

    // Category breakdown
    const categoryStats: Record<
      string,
      { total: number; passed: number; avgScore: number }
    > = {};

    challenges.forEach((c) => {
      if (!categoryStats[c.category]) {
        categoryStats[c.category] = { total: 0, passed: 0, avgScore: 0 };
      }
      categoryStats[c.category].total++;
      if (c.score?.passStatus) {
        categoryStats[c.category].passed++;
      }
      categoryStats[c.category].avgScore += c.score?.overallScore || 0;
    });

    // Calculate averages for categories
    Object.keys(categoryStats).forEach((cat) => {
      const stats = categoryStats[cat];
      stats.avgScore = stats.total > 0 ? stats.avgScore / stats.total : 0;
    });

    // Difficulty breakdown
    const difficultyStats: Record<
      string,
      { total: number; passed: number; avgScore: number }
    > = {};

    challenges.forEach((c) => {
      if (!difficultyStats[c.difficulty]) {
        difficultyStats[c.difficulty] = { total: 0, passed: 0, avgScore: 0 };
      }
      difficultyStats[c.difficulty].total++;
      if (c.score?.passStatus) {
        difficultyStats[c.difficulty].passed++;
      }
      difficultyStats[c.difficulty].avgScore += c.score?.overallScore || 0;
    });

    Object.keys(difficultyStats).forEach((diff) => {
      const stats = difficultyStats[diff];
      stats.avgScore = stats.total > 0 ? stats.avgScore / stats.total : 0;
    });

    // Language breakdown
    const languageStats: Record<string, { total: number; passed: number }> = {};

    challenges.forEach((c) => {
      if (!languageStats[c.language]) {
        languageStats[c.language] = { total: 0, passed: 0 };
      }
      languageStats[c.language].total++;
      if (c.score?.passStatus) {
        languageStats[c.language].passed++;
      }
    });

    // Recent performance trend (last 10 challenges)
    const recentChallenges = challenges.slice(0, 10);
    const scoreTrend = recentChallenges.map((c) => ({
      date: c.endedAt,
      score: c.score?.overallScore || 0,
      category: c.category,
      difficulty: c.difficulty,
      passed: c.score?.passStatus || false,
    }));

    // Identify weak and strong areas
    const dimensionScores = {
      correctness: avgCorrectness,
      efficiency: avgEfficiency,
      codeQuality: avgCodeQuality,
      edgeCases: avgEdgeCases,
    };

    const sortedDimensions = Object.entries(dimensionScores).sort(
      (a, b) => a[1] - b[1]
    );
    const weakAreas = sortedDimensions.slice(0, 2).map(([dim]) => dim);
    const strongAreas = sortedDimensions.slice(-2).map(([dim]) => dim);

    return NextResponse.json({
      summary: {
        totalChallenges,
        passedChallenges,
        passRate: Math.round(passRate * 10) / 10,
        avgOverallScore: Math.round(avgOverallScore * 10) / 10,
      },
      scores: {
        correctness: Math.round(avgCorrectness * 10) / 10,
        efficiency: Math.round(avgEfficiency * 10) / 10,
        codeQuality: Math.round(avgCodeQuality * 10) / 10,
        edgeCases: Math.round(avgEdgeCases * 10) / 10,
      },
      categoryStats,
      difficultyStats,
      languageStats,
      scoreTrend,
      insights: {
        weakAreas,
        strongAreas,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
