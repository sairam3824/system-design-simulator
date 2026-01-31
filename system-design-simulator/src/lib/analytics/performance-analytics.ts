/**
 * Performance Analytics Library
 *
 * Core analytics calculations for user performance tracking.
 * Tracks score progression, identifies weak areas, and generates insights.
 */

import { prisma } from "@/lib/prisma";

// Score dimension type for type-safe access
type ScoreDimension =
  | "requirementsClarification"
  | "highLevelDesign"
  | "detailedDesign"
  | "scalability"
  | "tradeoffs"
  | "communication";

// Helper to get score value from dimension key
function getScoreValue(
  score: {
    requirementsClarification: number;
    highLevelDesign: number;
    detailedDesign: number;
    scalability: number;
    tradeoffs: number;
    communication: number;
  },
  dimension: ScoreDimension
): number {
  return score[dimension];
}

// Types
export interface ScoreDataPoint {
  date: string;
  overallScore: number;
  passStatus: boolean;
  topic: string;
  interviewId: string;
}

export interface DimensionMetrics {
  avgScore: number;
  trend: "improving" | "stable" | "declining";
  isWeak: boolean; // Below 2.5
  isStrong: boolean; // Above 3.0
  recentScores: number[];
}

export interface WeakArea {
  dimension: string;
  avgScore: number;
  occurrences: number;
  lastScore: number;
  trend: "improving" | "stable" | "declining";
}

export interface PerformanceMetrics {
  overall: {
    totalInterviews: number;
    completedInterviews: number;
    avgScore: number;
    passRate: number;
    scoreTrend: "improving" | "stable" | "declining";
  };
  dimensions: {
    [key: string]: DimensionMetrics;
  };
  recentScores: ScoreDataPoint[];
  insights: string[];
  recommendations: string[];
}

// Dimension names mapping
const DIMENSION_NAMES: Record<string, string> = {
  requirementsClarification: "Requirements Clarification",
  highLevelDesign: "High-Level Design",
  detailedDesign: "Detailed Design",
  scalability: "Scalability",
  tradeoffs: "Trade-offs",
  communication: "Communication",
};

const DIMENSION_KEYS = Object.keys(DIMENSION_NAMES);

/**
 * Calculate trend from an array of scores (oldest to newest)
 */
export function calculateTrend(scores: number[]): "improving" | "stable" | "declining" {
  if (scores.length < 3) return "stable";

  // Use linear regression to determine trend
  const n = scores.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += scores[i];
    sumXY += i * scores[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Threshold for trend detection
  if (slope > 0.1) return "improving";
  if (slope < -0.1) return "declining";
  return "stable";
}

/**
 * Get score progression over time for a user
 */
export async function getScoreProgression(
  userId: string,
  dimension?: string,
  limit: number = 20
): Promise<ScoreDataPoint[]> {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      status: "completed",
    },
    orderBy: { endedAt: "asc" },
    take: limit,
    include: {
      score: true,
    },
  });

  return interviews
    .filter((i) => i.score)
    .map((interview) => ({
      date: interview.endedAt?.toISOString() || interview.createdAt.toISOString(),
      overallScore: dimension
        ? getScoreValue(interview.score!, dimension as ScoreDimension)
        : interview.score!.overallScore,
      passStatus: interview.score!.passStatus,
      topic: interview.topic,
      interviewId: interview.id,
    }));
}

/**
 * Identify weak areas for a user
 */
export async function identifyWeakAreas(userId: string, limit: number = 10): Promise<WeakArea[]> {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      status: "completed",
    },
    orderBy: { endedAt: "desc" },
    take: limit,
    include: {
      score: true,
    },
  });

  const dimensionScores: Record<string, number[]> = {};

  // Initialize arrays for each dimension
  DIMENSION_KEYS.forEach((key) => {
    dimensionScores[key] = [];
  });

  // Collect scores for each dimension
  for (const interview of interviews) {
    if (!interview.score) continue;

    DIMENSION_KEYS.forEach((key) => {
      const score = getScoreValue(interview.score!, key as ScoreDimension);
      if (score !== undefined) {
        dimensionScores[key].push(score);
      }
    });
  }

  // Calculate weak areas (avg < 2.5)
  const weakAreas: WeakArea[] = [];

  for (const [dimension, scores] of Object.entries(dimensionScores)) {
    if (scores.length === 0) continue;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore < 2.5) {
      weakAreas.push({
        dimension: DIMENSION_NAMES[dimension] || dimension,
        avgScore: Number(avgScore.toFixed(2)),
        occurrences: scores.filter((s) => s < 2.5).length,
        lastScore: scores[0], // Most recent
        trend: calculateTrend(scores.reverse()), // Oldest to newest for trend
      });
    }
  }

  // Sort by average score (weakest first)
  return weakAreas.sort((a, b) => a.avgScore - b.avgScore);
}

/**
 * Generate insights based on performance metrics
 */
export function generateInsights(metrics: PerformanceMetrics): string[] {
  const insights: string[] = [];

  // Overall performance insights
  if (metrics.overall.completedInterviews === 0) {
    insights.push("Complete your first interview to start tracking progress!");
    return insights;
  }

  if (metrics.overall.avgScore >= 3.0) {
    insights.push("Your overall performance is strong. You're ready for senior-level interviews.");
  } else if (metrics.overall.avgScore >= 2.5) {
    insights.push("You're performing at a passing level. Focus on your weak areas to improve.");
  } else {
    insights.push("Your scores indicate room for improvement. Consider more practice sessions.");
  }

  // Pass rate insights
  if (metrics.overall.passRate >= 80) {
    insights.push(`Excellent pass rate of ${metrics.overall.passRate.toFixed(0)}%!`);
  } else if (metrics.overall.passRate >= 50) {
    insights.push(`Your pass rate is ${metrics.overall.passRate.toFixed(0)}%. Aim for consistency.`);
  } else if (metrics.overall.completedInterviews >= 3) {
    insights.push(`Pass rate of ${metrics.overall.passRate.toFixed(0)}% needs attention. Review fundamentals.`);
  }

  // Trend insights
  if (metrics.overall.scoreTrend === "improving") {
    insights.push("Your scores are trending upward. Keep up the great work!");
  } else if (metrics.overall.scoreTrend === "declining") {
    insights.push("Your recent scores have declined. Consider reviewing basics.");
  }

  // Dimension-specific insights
  const weakDimensions = Object.entries(metrics.dimensions)
    .filter(([, m]) => m.isWeak)
    .map(([key]) => DIMENSION_NAMES[key] || key);

  if (weakDimensions.length > 0) {
    insights.push(`Focus areas: ${weakDimensions.join(", ")}`);
  }

  const strongDimensions = Object.entries(metrics.dimensions)
    .filter(([, m]) => m.isStrong)
    .map(([key]) => DIMENSION_NAMES[key] || key);

  if (strongDimensions.length > 0) {
    insights.push(`Strong areas: ${strongDimensions.join(", ")}`);
  }

  return insights;
}

/**
 * Generate recommendations based on performance
 */
export function generateRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.overall.completedInterviews === 0) {
    recommendations.push("Start with an easy difficulty interview to build confidence.");
    return recommendations;
  }

  // Weak dimension recommendations
  const weakDimensions = Object.entries(metrics.dimensions)
    .filter(([, m]) => m.isWeak)
    .sort((a, b) => a[1].avgScore - b[1].avgScore);

  for (const [key, dimMetrics] of weakDimensions.slice(0, 2)) {
    const name = DIMENSION_NAMES[key] || key;

    switch (key) {
      case "requirementsClarification":
        recommendations.push(
          `Practice asking clarifying questions about scale, users, and constraints.`
        );
        break;
      case "highLevelDesign":
        recommendations.push(
          `Study common system design patterns and practice drawing architecture diagrams.`
        );
        break;
      case "detailedDesign":
        recommendations.push(
          `Review data modeling, API design, and dive deeper into component internals.`
        );
        break;
      case "scalability":
        recommendations.push(
          `Study caching, sharding, load balancing, and horizontal scaling strategies.`
        );
        break;
      case "tradeoffs":
        recommendations.push(
          `Practice discussing CAP theorem, consistency vs availability, and cost tradeoffs.`
        );
        break;
      case "communication":
        recommendations.push(
          `Practice explaining your thought process clearly and structuring your responses.`
        );
        break;
      default:
        recommendations.push(`Focus on improving ${name} (current avg: ${dimMetrics.avgScore.toFixed(1)}).`);
    }
  }

  // Interview frequency recommendation
  if (metrics.overall.completedInterviews < 5) {
    recommendations.push("Complete at least 5 interviews to establish reliable patterns.");
  }

  // Difficulty recommendation
  if (metrics.overall.avgScore >= 3.0 && metrics.overall.passRate >= 70) {
    recommendations.push("Consider increasing difficulty to challenge yourself further.");
  } else if (metrics.overall.avgScore < 2.0) {
    recommendations.push("Try easier interviews to build foundational knowledge.");
  }

  return recommendations;
}

/**
 * Calculate comprehensive performance metrics for a user
 */
export async function calculatePerformanceMetrics(
  userId: string,
  limit: number = 20
): Promise<PerformanceMetrics> {
  // Fetch interview data
  const [totalCount, completedInterviews] = await Promise.all([
    prisma.interview.count({
      where: { userId },
    }),
    prisma.interview.findMany({
      where: {
        userId,
        status: "completed",
      },
      orderBy: { endedAt: "desc" },
      take: limit,
      include: {
        score: true,
      },
    }),
  ]);

  const completedCount = completedInterviews.length;
  const interviewsWithScores = completedInterviews.filter((i) => i.score);

  // Calculate overall metrics
  let avgScore = 0;
  let passCount = 0;
  const overallScores: number[] = [];

  for (const interview of interviewsWithScores) {
    avgScore += interview.score!.overallScore;
    if (interview.score!.passStatus) passCount++;
    overallScores.push(interview.score!.overallScore);
  }

  if (interviewsWithScores.length > 0) {
    avgScore /= interviewsWithScores.length;
  }

  const passRate = interviewsWithScores.length > 0
    ? (passCount / interviewsWithScores.length) * 100
    : 0;

  // Calculate dimension metrics
  const dimensionMetrics: Record<string, DimensionMetrics> = {};

  for (const key of DIMENSION_KEYS) {
    const scores: number[] = [];

    for (const interview of interviewsWithScores) {
      const score = getScoreValue(interview.score!, key as ScoreDimension);
      if (score !== undefined) {
        scores.push(score);
      }
    }

    if (scores.length > 0) {
      const dimAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
      dimensionMetrics[key] = {
        avgScore: Number(dimAvg.toFixed(2)),
        trend: calculateTrend(scores.reverse()), // Oldest to newest
        isWeak: dimAvg < 2.5,
        isStrong: dimAvg >= 3.0,
        recentScores: scores.slice(-5),
      };
    } else {
      dimensionMetrics[key] = {
        avgScore: 0,
        trend: "stable",
        isWeak: false,
        isStrong: false,
        recentScores: [],
      };
    }
  }

  // Build recent scores
  const recentScores: ScoreDataPoint[] = interviewsWithScores.map((i) => ({
    date: i.endedAt?.toISOString() || i.createdAt.toISOString(),
    overallScore: i.score!.overallScore,
    passStatus: i.score!.passStatus,
    topic: i.topic,
    interviewId: i.id,
  }));

  // Build metrics object
  const metrics: PerformanceMetrics = {
    overall: {
      totalInterviews: totalCount,
      completedInterviews: completedCount,
      avgScore: Number(avgScore.toFixed(2)),
      passRate: Number(passRate.toFixed(1)),
      scoreTrend: calculateTrend(overallScores.reverse()),
    },
    dimensions: dimensionMetrics,
    recentScores,
    insights: [],
    recommendations: [],
  };

  // Generate insights and recommendations
  metrics.insights = generateInsights(metrics);
  metrics.recommendations = generateRecommendations(metrics);

  return metrics;
}

/**
 * Update cached user analytics after an interview
 */
export async function updateUserAnalyticsCache(userId: string): Promise<void> {
  const metrics = await calculatePerformanceMetrics(userId, 50);

  // Extract weak and strong dimensions
  const weakDimensions = Object.entries(metrics.dimensions)
    .filter(([, m]) => m.isWeak)
    .map(([key]) => key);

  const strongDimensions = Object.entries(metrics.dimensions)
    .filter(([, m]) => m.isStrong)
    .map(([key]) => key);

  // Calculate topic stats
  const topicInterviews = await prisma.interview.findMany({
    where: { userId, status: "completed" },
    include: { score: true },
  });

  const topicStats: Record<string, { count: number; totalScore: number; passCount: number }> = {};

  for (const interview of topicInterviews) {
    if (!interview.score) continue;

    if (!topicStats[interview.topic]) {
      topicStats[interview.topic] = { count: 0, totalScore: 0, passCount: 0 };
    }

    topicStats[interview.topic].count++;
    topicStats[interview.topic].totalScore += interview.score.overallScore;
    if (interview.score.passStatus) {
      topicStats[interview.topic].passCount++;
    }
  }

  // Convert to final format
  const finalTopicStats: Record<string, { count: number; avgScore: number; passRate: number }> = {};
  for (const [topic, stats] of Object.entries(topicStats)) {
    finalTopicStats[topic] = {
      count: stats.count,
      avgScore: Number((stats.totalScore / stats.count).toFixed(2)),
      passRate: Number(((stats.passCount / stats.count) * 100).toFixed(1)),
    };
  }

  // Upsert analytics record
  await prisma.userAnalytics.upsert({
    where: { userId },
    create: {
      userId,
      totalInterviews: metrics.overall.totalInterviews,
      completedInterviews: metrics.overall.completedInterviews,
      avgOverallScore: metrics.overall.avgScore,
      passRate: metrics.overall.passRate,
      weakDimensions: JSON.stringify(weakDimensions),
      strongDimensions: JSON.stringify(strongDimensions),
      topicStats: JSON.stringify(finalTopicStats),
      scoreTrend: metrics.overall.scoreTrend,
      lastCalculatedAt: new Date(),
    },
    update: {
      totalInterviews: metrics.overall.totalInterviews,
      completedInterviews: metrics.overall.completedInterviews,
      avgOverallScore: metrics.overall.avgScore,
      passRate: metrics.overall.passRate,
      weakDimensions: JSON.stringify(weakDimensions),
      strongDimensions: JSON.stringify(strongDimensions),
      topicStats: JSON.stringify(finalTopicStats),
      scoreTrend: metrics.overall.scoreTrend,
      lastCalculatedAt: new Date(),
    },
  });
}

/**
 * Get performance category based on average score
 */
export function getPerformanceCategory(
  avgScore: number
): "struggling" | "developing" | "proficient" | "excelling" {
  if (avgScore < 2.0) return "struggling";
  if (avgScore < 2.5) return "developing";
  if (avgScore < 3.0) return "proficient";
  return "excelling";
}
