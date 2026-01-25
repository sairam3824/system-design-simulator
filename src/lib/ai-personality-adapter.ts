/**
 * AI Personality Adapter
 *
 * Adapts Bobby's interviewer personality based on user performance.
 * Adjusts encouragement level, challenge intensity, and questioning style.
 */

import {
  calculatePerformanceMetrics,
  getPerformanceCategory,
} from "./analytics/performance-analytics";

// Types
export interface PersonalitySettings {
  encouragementLevel: "high" | "moderate" | "low";
  challengeLevel: "gentle" | "standard" | "rigorous";
  hintFrequency: "frequent" | "occasional" | "rare";
  probingDepth: "surface" | "moderate" | "deep";
  paceAdjustment: "slower" | "standard" | "faster";
}

export interface AdaptedPersonality {
  settings: PersonalitySettings;
  promptModifications: string;
  reasonForAdaptation: string;
  performanceCategory: "struggling" | "developing" | "proficient" | "excelling";
}

// Personality presets based on performance category
const PERSONALITY_PRESETS: Record<string, PersonalitySettings> = {
  struggling: {
    encouragementLevel: "high",
    challengeLevel: "gentle",
    hintFrequency: "frequent",
    probingDepth: "surface",
    paceAdjustment: "slower",
  },
  developing: {
    encouragementLevel: "moderate",
    challengeLevel: "gentle",
    hintFrequency: "occasional",
    probingDepth: "moderate",
    paceAdjustment: "standard",
  },
  proficient: {
    encouragementLevel: "moderate",
    challengeLevel: "standard",
    hintFrequency: "occasional",
    probingDepth: "moderate",
    paceAdjustment: "standard",
  },
  excelling: {
    encouragementLevel: "low",
    challengeLevel: "rigorous",
    hintFrequency: "rare",
    probingDepth: "deep",
    paceAdjustment: "faster",
  },
};

/**
 * Calculate personality adaptation based on user's performance history
 */
export async function calculatePersonalityAdaptation(
  userId: string
): Promise<AdaptedPersonality> {
  const metrics = await calculatePerformanceMetrics(userId, 10);
  const category = getPerformanceCategory(metrics.overall.avgScore);
  const settings = { ...PERSONALITY_PRESETS[category] };

  // Fine-tune based on specific metrics
  if (metrics.overall.scoreTrend === "declining" && category !== "struggling") {
    // If declining, be more supportive
    settings.encouragementLevel = "high";
    settings.hintFrequency = "occasional";
  }

  if (metrics.overall.scoreTrend === "improving" && category === "struggling") {
    // If improving from a low base, acknowledge progress
    settings.encouragementLevel = "high";
    settings.challengeLevel = "gentle";
  }

  // Build prompt modifications
  const promptModifications = buildPersonalityPrompt(settings, category, metrics);

  // Build reason
  const reasonForAdaptation = buildAdaptationReason(category, metrics);

  return {
    settings,
    promptModifications,
    reasonForAdaptation,
    performanceCategory: category,
  };
}

/**
 * Build personality-adapted prompt section
 */
function buildPersonalityPrompt(
  settings: PersonalitySettings,
  category: string,
  metrics: Awaited<ReturnType<typeof calculatePerformanceMetrics>>
): string {
  let prompt = `
## Bobby's Adapted Personality for This Candidate

Based on this candidate's performance history, adapt your interviewer behavior:

### Encouragement Style (${settings.encouragementLevel})
`;

  switch (settings.encouragementLevel) {
    case "high":
      prompt += `- Be extra supportive and positive
- Celebrate good points with phrases like "That's a great insight!" or "Excellent thinking!"
- When they struggle, say things like "That's okay, let me help guide you..."
- Focus on building confidence
`;
      break;
    case "moderate":
      prompt += `- Acknowledge good points with brief praise like "Good" or "That works"
- Stay professional and constructive
- Offer encouragement when appropriate
`;
      break;
    case "low":
      prompt += `- Focus on technical accuracy over praise
- Keep feedback objective and direct
- Save encouragement for truly exceptional answers
`;
      break;
  }

  prompt += `
### Challenge Level (${settings.challengeLevel})
`;

  switch (settings.challengeLevel) {
    case "gentle":
      prompt += `- Start with fundamental questions before advancing
- Break complex topics into smaller parts
- Give them time to think and don't rush
- If they struggle, simplify the question
`;
      break;
    case "standard":
      prompt += `- Ask balanced questions that test understanding
- Probe on tradeoffs and alternatives
- Challenge decisions but accept reasonable answers
`;
      break;
    case "rigorous":
      prompt += `- Push hard on edge cases and failure scenarios
- Ask follow-up questions that test depth
- Challenge assumptions and expect precise answers
- Don't accept vague answers - probe deeper
`;
      break;
  }

  prompt += `
### Hints and Guidance (${settings.hintFrequency})
`;

  switch (settings.hintFrequency) {
    case "frequent":
      prompt += `- Provide hints proactively when they seem stuck
- Offer suggestions like "Have you considered...?" or "What about...?"
- Guide them towards good solutions
`;
      break;
    case "occasional":
      prompt += `- Give hints if they're clearly stuck after a reasonable attempt
- Let them work through problems independently first
`;
      break;
    case "rare":
      prompt += `- Only hint if absolutely necessary
- Let them struggle and find solutions independently
- They should demonstrate they can problem-solve
`;
      break;
  }

  prompt += `
### Probing Depth (${settings.probingDepth})
`;

  switch (settings.probingDepth) {
    case "surface":
      prompt += `- Focus on high-level understanding
- Don't dive too deep into implementation details
- Accept general answers for complex topics
`;
      break;
    case "moderate":
      prompt += `- Balance high-level and detailed questions
- Probe on important design decisions
`;
      break;
    case "deep":
      prompt += `- Expect detailed explanations for all decisions
- Ask about implementation specifics, data structures, algorithms
- Test knowledge of edge cases and failure modes
`;
      break;
  }

  // Add performance context
  if (metrics.overall.completedInterviews > 0) {
    prompt += `
### Performance Context
- Past interviews: ${metrics.overall.completedInterviews}
- Average score: ${metrics.overall.avgScore}/4.0
- Pass rate: ${metrics.overall.passRate}%
- Trend: ${metrics.overall.scoreTrend}
`;
  }

  return prompt;
}

/**
 * Build human-readable reason for adaptation
 */
function buildAdaptationReason(
  category: string,
  metrics: Awaited<ReturnType<typeof calculatePerformanceMetrics>>
): string {
  if (metrics.overall.completedInterviews === 0) {
    return "First interview - using standard settings.";
  }

  switch (category) {
    case "struggling":
      return `Candidate's average score (${metrics.overall.avgScore}/4) indicates they need more support. Bobby will be more encouraging and provide more guidance.`;
    case "developing":
      return `Candidate is developing (${metrics.overall.avgScore}/4). Bobby will balance support with challenge.`;
    case "proficient":
      return `Candidate shows proficiency (${metrics.overall.avgScore}/4). Bobby will use standard interview approach.`;
    case "excelling":
      return `Candidate is excelling (${metrics.overall.avgScore}/4). Bobby will be more rigorous and challenging.`;
    default:
      return "Using standard interview settings.";
  }
}

/**
 * Build adapted system prompt by combining base prompt with personality modifications
 */
export function buildAdaptedSystemPrompt(
  basePrompt: string,
  personality: AdaptedPersonality
): string {
  // Insert personality modifications after the base interviewer description
  const insertPoint = basePrompt.indexOf("## Interview Structure");

  if (insertPoint === -1) {
    // If we can't find the structure section, append at the end
    return `${basePrompt}\n\n${personality.promptModifications}`;
  }

  return (
    basePrompt.slice(0, insertPoint) +
    personality.promptModifications +
    "\n\n" +
    basePrompt.slice(insertPoint)
  );
}

/**
 * Get default personality settings for users without history
 */
export function getDefaultPersonalitySettings(): PersonalitySettings {
  return {
    encouragementLevel: "moderate",
    challengeLevel: "standard",
    hintFrequency: "occasional",
    probingDepth: "moderate",
    paceAdjustment: "standard",
  };
}

/**
 * Re-export performance category function
 */
export { getPerformanceCategory } from "./analytics/performance-analytics";
