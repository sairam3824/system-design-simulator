/**
 * Follow-up Questions Engine
 *
 * Generates follow-up questions based on past weak points.
 * AI remembers previous attempts and asks about past weak points.
 */

import { prisma } from "@/lib/prisma";
import { identifyWeakAreas, calculatePerformanceMetrics } from "./analytics/performance-analytics";

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
export interface WeakPoint {
  dimension: string;
  dimensionKey: string;
  topic: string;
  concept: string;
  lastScore: number;
  occurrences: number;
  trend: "improving" | "stable" | "declining";
}

export interface FollowUpContext {
  weakPoints: WeakPoint[];
  topicsToReinforce: string[];
  conceptsToProbe: string[];
  adaptedDifficulty: "easier" | "standard" | "harder";
  hasHistory: boolean;
  totalPastInterviews: number;
}

// Dimension to concept mapping
const DIMENSION_CONCEPTS: Record<string, string[]> = {
  requirementsClarification: [
    "scale estimation (DAU, QPS)",
    "functional vs non-functional requirements",
    "latency and availability requirements",
    "data consistency requirements",
    "feature prioritization",
  ],
  highLevelDesign: [
    "API design and endpoints",
    "component architecture",
    "database selection",
    "data flow between components",
    "service boundaries",
  ],
  detailedDesign: [
    "data models and schemas",
    "algorithm choices",
    "caching strategies",
    "protocol selection",
    "failure handling",
  ],
  scalability: [
    "horizontal vs vertical scaling",
    "database sharding",
    "load balancing strategies",
    "caching layers",
    "CDN usage",
  ],
  tradeoffs: [
    "CAP theorem implications",
    "consistency vs availability",
    "cost vs performance",
    "latency vs throughput",
    "complexity vs maintainability",
  ],
  communication: [
    "structured thinking",
    "clear explanations",
    "diagram usage",
    "time management",
    "handling clarifications",
  ],
};

// Dimension names
const DIMENSION_NAMES: Record<string, string> = {
  requirementsClarification: "Requirements Clarification",
  highLevelDesign: "High-Level Design",
  detailedDesign: "Detailed Design",
  scalability: "Scalability",
  tradeoffs: "Trade-offs",
  communication: "Communication",
};

/**
 * Get weak points for a user based on past interview performance
 */
export async function getWeakPointsForUser(
  userId: string,
  limit: number = 10
): Promise<WeakPoint[]> {
  const weakAreas = await identifyWeakAreas(userId, limit);

  // Convert weak areas to weak points with concepts
  const weakPoints: WeakPoint[] = [];

  for (const area of weakAreas) {
    // Find the dimension key from the display name
    const dimensionKey = Object.entries(DIMENSION_NAMES).find(
      ([, name]) => name === area.dimension
    )?.[0];

    if (!dimensionKey) continue;

    const concepts = DIMENSION_CONCEPTS[dimensionKey] || [];

    // Select 1-2 relevant concepts to probe based on the weak area
    const conceptsToProbe = concepts.slice(0, 2);

    weakPoints.push({
      dimension: area.dimension,
      dimensionKey,
      topic: "", // Will be filled with specific topic if available
      concept: conceptsToProbe.join(", "),
      lastScore: area.lastScore,
      occurrences: area.occurrences,
      trend: area.trend,
    });
  }

  return weakPoints;
}

/**
 * Build follow-up context for a new interview
 */
export async function buildFollowUpContext(
  userId: string,
  currentTopic: string
): Promise<FollowUpContext> {
  // Get performance metrics
  const metrics = await calculatePerformanceMetrics(userId, 15);

  // Get weak points
  const weakPoints = await getWeakPointsForUser(userId, 10);

  // Get topics that need reinforcement
  const topicInterviews = await prisma.interview.findMany({
    where: {
      userId,
      status: "completed",
    },
    include: { score: true },
    orderBy: { endedAt: "desc" },
    take: 20,
  });

  // Find topics with low pass rates
  const topicStats: Record<string, { total: number; passed: number }> = {};

  for (const interview of topicInterviews) {
    if (!interview.score) continue;

    if (!topicStats[interview.topic]) {
      topicStats[interview.topic] = { total: 0, passed: 0 };
    }

    topicStats[interview.topic].total++;
    if (interview.score.passStatus) {
      topicStats[interview.topic].passed++;
    }
  }

  const topicsToReinforce = Object.entries(topicStats)
    .filter(([, stats]) => stats.total >= 2 && stats.passed / stats.total < 0.5)
    .map(([topic]) => topic);

  // Determine concepts to probe based on weak points
  const conceptsToProbe: string[] = [];

  for (const wp of weakPoints.slice(0, 3)) {
    const concepts = DIMENSION_CONCEPTS[wp.dimensionKey] || [];
    conceptsToProbe.push(...concepts.slice(0, 2));
  }

  // Determine difficulty adaptation
  let adaptedDifficulty: "easier" | "standard" | "harder" = "standard";

  if (metrics.overall.avgScore < 2.0) {
    adaptedDifficulty = "easier";
  } else if (metrics.overall.avgScore >= 3.0 && metrics.overall.passRate >= 70) {
    adaptedDifficulty = "harder";
  }

  return {
    weakPoints,
    topicsToReinforce,
    conceptsToProbe: [...new Set(conceptsToProbe)], // Remove duplicates
    adaptedDifficulty,
    hasHistory: metrics.overall.completedInterviews > 0,
    totalPastInterviews: metrics.overall.completedInterviews,
  };
}

/**
 * Generate prompt addition for follow-up context
 */
export function generateFollowUpPromptAddition(context: FollowUpContext): string {
  if (!context.hasHistory || context.weakPoints.length === 0) {
    return "";
  }

  let prompt = `
## Candidate's Past Performance Context

This candidate has completed ${context.totalPastInterviews} previous interview${context.totalPastInterviews === 1 ? "" : "s"}.

### Weak Areas to Focus On
`;

  for (const wp of context.weakPoints.slice(0, 3)) {
    prompt += `- **${wp.dimension}** (avg score: ${wp.lastScore}/4, trend: ${wp.trend})
  - Concepts to probe: ${wp.concept}
`;
  }

  if (context.conceptsToProbe.length > 0) {
    prompt += `
### Specific Concepts to Cover
During the interview, make sure to ask about:
${context.conceptsToProbe.map((c) => `- ${c}`).join("\n")}
`;
  }

  if (context.topicsToReinforce.length > 0) {
    prompt += `
### Related Topics With Low Performance
The candidate has struggled with these related topics: ${context.topicsToReinforce.join(", ")}
Consider asking questions that reinforce fundamentals from these areas.
`;
  }

  prompt += `
### Adaptation Instructions
- Difficulty adaptation: ${context.adaptedDifficulty}
${context.adaptedDifficulty === "easier" ? "- Provide more hints and guidance for this candidate" : ""}
${context.adaptedDifficulty === "harder" ? "- Challenge this candidate with edge cases and deeper probing" : ""}
- When the candidate answers questions related to their weak areas, probe deeper
- Acknowledge improvement if they perform better on previously weak dimensions
`;

  return prompt;
}

/**
 * Track improvement on a specific concept (for future enhancement)
 */
export async function trackConceptImprovement(
  userId: string,
  interviewId: string,
  dimension: string,
  newScore: number
): Promise<{ improved: boolean; previousScore: number | null }> {
  // Get the previous score for this dimension
  const previousInterviews = await prisma.interview.findMany({
    where: {
      userId,
      status: "completed",
      id: { not: interviewId },
    },
    include: { score: true },
    orderBy: { endedAt: "desc" },
    take: 5,
  });

  const previousScores = previousInterviews
    .filter((i) => i.score)
    .map((i) => getScoreValue(i.score!, dimension as ScoreDimension))
    .filter((s) => s !== undefined);

  if (previousScores.length === 0) {
    return { improved: false, previousScore: null };
  }

  const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;

  return {
    improved: newScore > previousAvg,
    previousScore: Number(previousAvg.toFixed(2)),
  };
}
