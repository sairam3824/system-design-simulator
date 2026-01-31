/**
 * Topic Analytics Library
 *
 * Topic-wise performance analysis to identify which system design topics
 * need more practice and which ones the user is excelling at.
 */

import { prisma } from "@/lib/prisma";
import { calculateTrend } from "./performance-analytics";

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
export interface TopicAnalysis {
  topic: string;
  interviewCount: number;
  completedCount: number;
  avgScore: number;
  passRate: number;
  bestDimension: string;
  worstDimension: string;
  trend: "improving" | "stable" | "declining";
  lastAttempt: string | null;
  recommendedForPractice: boolean;
}

export interface TopicGroupedStats {
  topics: TopicAnalysis[];
  recommendations: {
    needsPractice: string[]; // Topics with < 60% pass rate
    readyForHarder: string[]; // Topics with > 80% pass rate
  };
  overallTopicCoverage: number; // Number of unique topics attempted
}

// Dimension names mapping
const DIMENSION_NAMES: Record<string, string> = {
  requirementsClarification: "Requirements",
  highLevelDesign: "High-Level Design",
  detailedDesign: "Detailed Design",
  scalability: "Scalability",
  tradeoffs: "Trade-offs",
  communication: "Communication",
};

const DIMENSION_KEYS = Object.keys(DIMENSION_NAMES);

/**
 * Get detailed analysis for a specific topic
 */
export async function getTopicDetails(
  userId: string,
  topic: string
): Promise<TopicAnalysis | null> {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      topic,
    },
    orderBy: { endedAt: "desc" },
    include: {
      score: true,
    },
  });

  if (interviews.length === 0) return null;

  const completedInterviews = interviews.filter((i) => i.status === "completed" && i.score);
  const overallScores: number[] = [];
  let passCount = 0;

  // Track dimension scores
  const dimensionScores: Record<string, number[]> = {};
  DIMENSION_KEYS.forEach((key) => {
    dimensionScores[key] = [];
  });

  for (const interview of completedInterviews) {
    if (!interview.score) continue;

    overallScores.push(interview.score.overallScore);
    if (interview.score.passStatus) passCount++;

    // Collect dimension scores
    DIMENSION_KEYS.forEach((key) => {
      const score = getScoreValue(interview.score!, key as ScoreDimension);
      if (score !== undefined) {
        dimensionScores[key].push(score);
      }
    });
  }

  const avgScore =
    overallScores.length > 0
      ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
      : 0;

  const passRate =
    completedInterviews.length > 0
      ? (passCount / completedInterviews.length) * 100
      : 0;

  // Find best and worst dimensions
  let bestDimension = "";
  let worstDimension = "";
  let bestAvg = 0;
  let worstAvg = 5;

  for (const [key, scores] of Object.entries(dimensionScores)) {
    if (scores.length === 0) continue;

    const dimAvg = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (dimAvg > bestAvg) {
      bestAvg = dimAvg;
      bestDimension = DIMENSION_NAMES[key] || key;
    }
    if (dimAvg < worstAvg) {
      worstAvg = dimAvg;
      worstDimension = DIMENSION_NAMES[key] || key;
    }
  }

  return {
    topic,
    interviewCount: interviews.length,
    completedCount: completedInterviews.length,
    avgScore: Number(avgScore.toFixed(2)),
    passRate: Number(passRate.toFixed(1)),
    bestDimension,
    worstDimension,
    trend: calculateTrend(overallScores.reverse()),
    lastAttempt: interviews[0]?.endedAt?.toISOString() || interviews[0]?.createdAt.toISOString() || null,
    recommendedForPractice: passRate < 60 && completedInterviews.length >= 2,
  };
}

/**
 * Get topic-wise analysis for all topics a user has attempted
 */
export async function getTopicWiseAnalysis(userId: string): Promise<TopicGroupedStats> {
  // Get all interviews grouped by topic
  const interviews = await prisma.interview.findMany({
    where: { userId },
    include: { score: true },
    orderBy: { endedAt: "desc" },
  });

  // Group by topic
  const topicMap: Record<string, typeof interviews> = {};

  for (const interview of interviews) {
    if (!topicMap[interview.topic]) {
      topicMap[interview.topic] = [];
    }
    topicMap[interview.topic].push(interview);
  }

  // Calculate analysis for each topic
  const topics: TopicAnalysis[] = [];
  const needsPractice: string[] = [];
  const readyForHarder: string[] = [];

  for (const [topic, topicInterviews] of Object.entries(topicMap)) {
    const completedInterviews = topicInterviews.filter(
      (i) => i.status === "completed" && i.score
    );

    if (completedInterviews.length === 0) {
      topics.push({
        topic,
        interviewCount: topicInterviews.length,
        completedCount: 0,
        avgScore: 0,
        passRate: 0,
        bestDimension: "",
        worstDimension: "",
        trend: "stable",
        lastAttempt: topicInterviews[0]?.createdAt.toISOString() || null,
        recommendedForPractice: true,
      });
      needsPractice.push(topic);
      continue;
    }

    const overallScores: number[] = [];
    let passCount = 0;

    // Track dimension scores
    const dimensionScores: Record<string, number[]> = {};
    DIMENSION_KEYS.forEach((key) => {
      dimensionScores[key] = [];
    });

    for (const interview of completedInterviews) {
      if (!interview.score) continue;

      overallScores.push(interview.score.overallScore);
      if (interview.score.passStatus) passCount++;

      DIMENSION_KEYS.forEach((key) => {
        const score = getScoreValue(interview.score!, key as ScoreDimension);
        if (score !== undefined) {
          dimensionScores[key].push(score);
        }
      });
    }

    const avgScore = overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
    const passRate = (passCount / completedInterviews.length) * 100;

    // Find best and worst dimensions
    let bestDimension = "";
    let worstDimension = "";
    let bestAvg = 0;
    let worstAvg = 5;

    for (const [key, scores] of Object.entries(dimensionScores)) {
      if (scores.length === 0) continue;

      const dimAvg = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (dimAvg > bestAvg) {
        bestAvg = dimAvg;
        bestDimension = DIMENSION_NAMES[key] || key;
      }
      if (dimAvg < worstAvg) {
        worstAvg = dimAvg;
        worstDimension = DIMENSION_NAMES[key] || key;
      }
    }

    const recommendedForPractice = passRate < 60 && completedInterviews.length >= 2;

    topics.push({
      topic,
      interviewCount: topicInterviews.length,
      completedCount: completedInterviews.length,
      avgScore: Number(avgScore.toFixed(2)),
      passRate: Number(passRate.toFixed(1)),
      bestDimension,
      worstDimension,
      trend: calculateTrend(overallScores.reverse()),
      lastAttempt: topicInterviews[0]?.endedAt?.toISOString() || topicInterviews[0]?.createdAt.toISOString() || null,
      recommendedForPractice,
    });

    // Categorize for recommendations
    if (passRate < 60 && completedInterviews.length >= 2) {
      needsPractice.push(topic);
    } else if (passRate >= 80 && completedInterviews.length >= 3) {
      readyForHarder.push(topic);
    }
  }

  // Sort topics by pass rate (lowest first to highlight weak areas)
  topics.sort((a, b) => a.passRate - b.passRate);

  return {
    topics,
    recommendations: {
      needsPractice,
      readyForHarder,
    },
    overallTopicCoverage: Object.keys(topicMap).length,
  };
}

/**
 * Identify topics that need more practice
 */
export async function identifyTopicsNeedingPractice(userId: string): Promise<string[]> {
  const analysis = await getTopicWiseAnalysis(userId);
  return analysis.recommendations.needsPractice;
}

/**
 * Get suggested next topic based on performance
 */
export async function getSuggestedTopic(userId: string): Promise<string | null> {
  const analysis = await getTopicWiseAnalysis(userId);

  // First priority: topics needing practice
  if (analysis.recommendations.needsPractice.length > 0) {
    return analysis.recommendations.needsPractice[0];
  }

  // Second priority: topics with low attempt count but some completion
  const lowAttemptTopics = analysis.topics
    .filter((t) => t.completedCount > 0 && t.completedCount < 3)
    .sort((a, b) => a.completedCount - b.completedCount);

  if (lowAttemptTopics.length > 0) {
    return lowAttemptTopics[0].topic;
  }

  return null;
}
