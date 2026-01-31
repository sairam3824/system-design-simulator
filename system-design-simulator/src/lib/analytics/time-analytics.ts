/**
 * Time Analytics Library
 *
 * Time allocation analysis across interview phases.
 * Tracks time spent in each phase and identifies patterns.
 */

import { prisma } from "@/lib/prisma";

// Phase configuration with recommended durations (in seconds)
const PHASE_CONFIG = {
  requirements: { name: "Requirements Clarification", recommended: 8 * 60 }, // 8 minutes
  "high-level": { name: "High-Level Design", recommended: 12 * 60 }, // 12 minutes
  "deep-dive": { name: "Deep Dive", recommended: 12 * 60 }, // 12 minutes
  scalability: { name: "Scalability", recommended: 10 * 60 }, // 10 minutes
  wrapup: { name: "Wrap-up", recommended: 3 * 60 }, // 3 minutes
} as const;

type PhaseId = keyof typeof PHASE_CONFIG;

// Types
export interface PhaseTimeData {
  phaseId: string;
  phaseName: string;
  recommendedDuration: number; // seconds
  actualDuration: number; // seconds
  deviation: number; // percentage from recommended (positive = over, negative = under)
  isOverTime: boolean;
  isUnderTime: boolean;
}

export interface TimeAnalysis {
  totalInterviewDuration: number;
  phases: PhaseTimeData[];
  averagePhaseAllocation: {
    [phaseId: string]: {
      avgDuration: number;
      avgDeviation: number;
    };
  };
  patterns: {
    rushesRequirements: boolean;
    spendsExcessiveOnDeepDive: boolean;
    neglectsScalability: boolean;
    skipsWrapup: boolean;
  };
  recommendations: string[];
}

export interface PhaseTransition {
  phase: string;
  startedAt: string;
  endedAt?: string;
}

/**
 * Calculate deviation percentage from recommended duration
 */
export function calculatePhaseDeviation(actual: number, recommended: number): number {
  if (recommended === 0) return 0;
  return ((actual - recommended) / recommended) * 100;
}

/**
 * Analyze time allocation for a single interview
 */
export async function analyzeInterviewTime(interviewId: string): Promise<TimeAnalysis | null> {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: {
      startedAt: true,
      endedAt: true,
      phaseDurations: true,
      phaseTransitions: true,
    },
  });

  if (!interview) return null;

  const phaseDurations: Record<string, number> = interview.phaseDurations
    ? JSON.parse(interview.phaseDurations)
    : {};

  // Calculate total duration
  let totalDuration = 0;
  if (interview.startedAt && interview.endedAt) {
    totalDuration = Math.floor(
      (new Date(interview.endedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000
    );
  } else {
    totalDuration = Object.values(phaseDurations).reduce((sum, d) => sum + d, 0);
  }

  // Build phase data
  const phases: PhaseTimeData[] = [];

  for (const [phaseId, config] of Object.entries(PHASE_CONFIG)) {
    const actualDuration = phaseDurations[phaseId] || 0;
    const deviation = calculatePhaseDeviation(actualDuration, config.recommended);

    phases.push({
      phaseId,
      phaseName: config.name,
      recommendedDuration: config.recommended,
      actualDuration,
      deviation: Number(deviation.toFixed(1)),
      isOverTime: deviation > 20, // More than 20% over
      isUnderTime: deviation < -30, // More than 30% under
    });
  }

  // Detect patterns
  const patterns = {
    rushesRequirements:
      (phaseDurations.requirements || 0) < PHASE_CONFIG.requirements.recommended * 0.5,
    spendsExcessiveOnDeepDive:
      (phaseDurations["deep-dive"] || 0) > PHASE_CONFIG["deep-dive"].recommended * 1.5,
    neglectsScalability:
      (phaseDurations.scalability || 0) < PHASE_CONFIG.scalability.recommended * 0.4,
    skipsWrapup: (phaseDurations.wrapup || 0) < 60, // Less than 1 minute
  };

  // Generate recommendations
  const recommendations = generateTimeRecommendations(phases, patterns);

  return {
    totalInterviewDuration: totalDuration,
    phases,
    averagePhaseAllocation: {}, // Single interview doesn't have averages
    patterns,
    recommendations,
  };
}

/**
 * Analyze time patterns across multiple interviews for a user
 */
export async function getUserTimePatterns(userId: string, limit: number = 10): Promise<TimeAnalysis> {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
      status: "completed",
      phaseDurations: { not: null },
    },
    orderBy: { endedAt: "desc" },
    take: limit,
    select: {
      startedAt: true,
      endedAt: true,
      phaseDurations: true,
    },
  });

  if (interviews.length === 0) {
    return {
      totalInterviewDuration: 0,
      phases: Object.entries(PHASE_CONFIG).map(([phaseId, config]) => ({
        phaseId,
        phaseName: config.name,
        recommendedDuration: config.recommended,
        actualDuration: 0,
        deviation: 0,
        isOverTime: false,
        isUnderTime: false,
      })),
      averagePhaseAllocation: {},
      patterns: {
        rushesRequirements: false,
        spendsExcessiveOnDeepDive: false,
        neglectsScalability: false,
        skipsWrapup: false,
      },
      recommendations: ["Complete more interviews to see time pattern analysis."],
    };
  }

  // Aggregate phase durations
  const phaseAggregates: Record<string, number[]> = {};
  let totalDurationSum = 0;

  for (const phaseId of Object.keys(PHASE_CONFIG)) {
    phaseAggregates[phaseId] = [];
  }

  for (const interview of interviews) {
    const phaseDurations: Record<string, number> = interview.phaseDurations
      ? JSON.parse(interview.phaseDurations)
      : {};

    // Calculate total duration for this interview
    if (interview.startedAt && interview.endedAt) {
      totalDurationSum += Math.floor(
        (new Date(interview.endedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000
      );
    }

    for (const [phaseId] of Object.entries(PHASE_CONFIG)) {
      if (phaseDurations[phaseId] !== undefined) {
        phaseAggregates[phaseId].push(phaseDurations[phaseId]);
      }
    }
  }

  // Calculate averages
  const averagePhaseAllocation: Record<string, { avgDuration: number; avgDeviation: number }> = {};
  const phases: PhaseTimeData[] = [];

  for (const [phaseId, config] of Object.entries(PHASE_CONFIG)) {
    const durations = phaseAggregates[phaseId];
    const avgDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const avgDeviation = calculatePhaseDeviation(avgDuration, config.recommended);

    averagePhaseAllocation[phaseId] = {
      avgDuration: Math.round(avgDuration),
      avgDeviation: Number(avgDeviation.toFixed(1)),
    };

    phases.push({
      phaseId,
      phaseName: config.name,
      recommendedDuration: config.recommended,
      actualDuration: Math.round(avgDuration),
      deviation: Number(avgDeviation.toFixed(1)),
      isOverTime: avgDeviation > 20,
      isUnderTime: avgDeviation < -30,
    });
  }

  // Detect patterns based on averages
  const patterns = {
    rushesRequirements:
      (averagePhaseAllocation.requirements?.avgDuration || 0) <
      PHASE_CONFIG.requirements.recommended * 0.5,
    spendsExcessiveOnDeepDive:
      (averagePhaseAllocation["deep-dive"]?.avgDuration || 0) >
      PHASE_CONFIG["deep-dive"].recommended * 1.5,
    neglectsScalability:
      (averagePhaseAllocation.scalability?.avgDuration || 0) <
      PHASE_CONFIG.scalability.recommended * 0.4,
    skipsWrapup: (averagePhaseAllocation.wrapup?.avgDuration || 0) < 60,
  };

  // Generate recommendations
  const recommendations = generateTimeRecommendations(phases, patterns);

  return {
    totalInterviewDuration: Math.round(totalDurationSum / interviews.length),
    phases,
    averagePhaseAllocation,
    patterns,
    recommendations,
  };
}

/**
 * Generate recommendations based on time patterns
 */
function generateTimeRecommendations(
  phases: PhaseTimeData[],
  patterns: TimeAnalysis["patterns"]
): string[] {
  const recommendations: string[] = [];

  if (patterns.rushesRequirements) {
    recommendations.push(
      "Spend more time on requirements clarification. Ask about scale, users, and constraints before designing."
    );
  }

  if (patterns.spendsExcessiveOnDeepDive) {
    recommendations.push(
      "You're spending too much time on deep dive. Keep some time for scalability discussion."
    );
  }

  if (patterns.neglectsScalability) {
    recommendations.push(
      "Allocate more time to discuss scalability. This is a critical part of system design interviews."
    );
  }

  if (patterns.skipsWrapup) {
    recommendations.push(
      "Don't skip the wrap-up phase. Use it to summarize your design and address concerns."
    );
  }

  // Check for specific phase imbalances
  for (const phase of phases) {
    if (phase.isOverTime && phase.deviation > 50) {
      recommendations.push(
        `You're spending ${Math.round(phase.deviation)}% more time than recommended on ${phase.phaseName}.`
      );
    }
    if (phase.isUnderTime && phase.deviation < -50) {
      recommendations.push(
        `You're spending ${Math.abs(Math.round(phase.deviation))}% less time than recommended on ${phase.phaseName}.`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Your time allocation is well-balanced across phases. Keep it up!");
  }

  return recommendations;
}

/**
 * Get phase time summary for display
 */
export function formatPhaseDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate phase at a given elapsed time
 */
export function calculatePhaseAtTime(elapsedSeconds: number): PhaseId {
  const totalTime = 45 * 60; // 45 minutes total
  const remainingTime = totalTime - elapsedSeconds;
  const minutesLeft = remainingTime / 60;

  if (minutesLeft > 37) return "requirements";
  if (minutesLeft > 25) return "high-level";
  if (minutesLeft > 13) return "deep-dive";
  if (minutesLeft > 3) return "scalability";
  return "wrapup";
}
