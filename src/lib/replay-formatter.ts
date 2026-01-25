/**
 * Interview Replay Formatter
 *
 * Formats interview transcripts for replay with phase markers and timing information.
 */

import { prisma } from "@/lib/prisma";
import { calculatePhaseAtTime } from "./analytics/time-analytics";

// Types
export interface ReplayMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  elapsedTime: number; // Seconds from interview start
  phase: string;
  phaseProgress: number; // Percentage through current phase (0-100)
}

export interface PhaseMarker {
  id: string;
  name: string;
  startTime: number; // Seconds from interview start
  endTime: number;
  messageCount: number;
  messageStartIndex: number;
}

export interface KeyMoment {
  description: string;
  messageIndex: number;
  timestamp: string;
  type: "phase_transition" | "good_answer" | "needs_improvement" | "question";
}

export interface InterviewReplay {
  interviewId: string;
  topic: string;
  difficulty: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  totalDuration: number; // Seconds
  phases: PhaseMarker[];
  messages: ReplayMessage[];
  navigation: {
    phaseMarkers: { phase: string; messageIndex: number }[];
    keyMoments: KeyMoment[];
  };
  score: {
    overallScore: number;
    passStatus: boolean;
  } | null;
}

// Phase configuration
const PHASE_CONFIG: Record<string, { name: string; startMinute: number; endMinute: number }> = {
  requirements: { name: "Requirements Clarification", startMinute: 45, endMinute: 37 },
  "high-level": { name: "High-Level Design", startMinute: 37, endMinute: 25 },
  "deep-dive": { name: "Deep Dive", startMinute: 25, endMinute: 13 },
  scalability: { name: "Scalability", startMinute: 13, endMinute: 3 },
  wrapup: { name: "Wrap-up", startMinute: 3, endMinute: 0 },
};

/**
 * Get full interview replay data
 */
export async function getInterviewReplay(interviewId: string): Promise<InterviewReplay | null> {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
      },
      score: true,
    },
  });

  if (!interview) return null;

  const startedAt = interview.startedAt;
  const endedAt = interview.endedAt;

  // Calculate total duration
  let totalDuration = 0;
  if (startedAt && endedAt) {
    totalDuration = Math.floor(
      (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );
  }

  // Parse phase transitions if available
  const phaseTransitions: Array<{ phase: string; startedAt: string; endedAt?: string }> =
    interview.phaseTransitions ? JSON.parse(interview.phaseTransitions) : [];

  // Format messages for replay
  const replayMessages = formatMessagesForReplay(
    interview.messages,
    startedAt ? new Date(startedAt) : new Date(interview.createdAt),
    phaseTransitions
  );

  // Build phase markers
  const phases = buildPhaseMarkers(replayMessages, phaseTransitions, totalDuration);

  // Find key moments
  const keyMoments = findKeyMoments(replayMessages, interview.messages);

  // Build phase navigation markers
  const phaseNavigationMarkers = phases.map((p) => ({
    phase: p.name,
    messageIndex: p.messageStartIndex,
  }));

  return {
    interviewId: interview.id,
    topic: interview.topic,
    difficulty: interview.difficulty,
    status: interview.status,
    startedAt: startedAt?.toISOString() || null,
    endedAt: endedAt?.toISOString() || null,
    totalDuration,
    phases,
    messages: replayMessages,
    navigation: {
      phaseMarkers: phaseNavigationMarkers,
      keyMoments,
    },
    score: interview.score
      ? {
          overallScore: interview.score.overallScore,
          passStatus: interview.score.passStatus,
        }
      : null,
  };
}

/**
 * Format messages for replay with timing and phase information
 */
export function formatMessagesForReplay(
  messages: Array<{ id: string; role: string; content: string; timestamp: Date }>,
  startedAt: Date,
  phaseTransitions: Array<{ phase: string; startedAt: string; endedAt?: string }>
): ReplayMessage[] {
  return messages
    .filter((m) => m.role !== "system") // Exclude system messages from replay
    .map((message) => {
      const elapsedTime = Math.floor(
        (new Date(message.timestamp).getTime() - startedAt.getTime()) / 1000
      );

      // Determine phase based on transitions or elapsed time
      let phase: string = calculatePhaseAtTime(elapsedTime);
      let phaseProgress = 0;

      // Check if we have explicit transitions
      for (const transition of phaseTransitions) {
        const transitionStart = new Date(transition.startedAt).getTime();
        const transitionEnd = transition.endedAt
          ? new Date(transition.endedAt).getTime()
          : Date.now();
        const messageTime = new Date(message.timestamp).getTime();

        if (messageTime >= transitionStart && messageTime <= transitionEnd) {
          phase = transition.phase;

          // Calculate progress through this phase
          const phaseElapsed = messageTime - transitionStart;
          const phaseDuration = transitionEnd - transitionStart;
          phaseProgress = Math.min(100, Math.round((phaseElapsed / phaseDuration) * 100));
          break;
        }
      }

      return {
        id: message.id,
        role: message.role as "user" | "assistant" | "system",
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        elapsedTime,
        phase: PHASE_CONFIG[phase]?.name || phase,
        phaseProgress,
      };
    });
}

/**
 * Build phase markers from messages and transitions
 */
function buildPhaseMarkers(
  replayMessages: ReplayMessage[],
  phaseTransitions: Array<{ phase: string; startedAt: string; endedAt?: string }>,
  totalDuration: number
): PhaseMarker[] {
  const phases: PhaseMarker[] = [];

  if (phaseTransitions.length > 0) {
    // Build from explicit transitions
    for (let i = 0; i < phaseTransitions.length; i++) {
      const transition = phaseTransitions[i];
      const startTime = new Date(transition.startedAt).getTime();
      const endTime = transition.endedAt
        ? new Date(transition.endedAt).getTime()
        : startTime + 10 * 60 * 1000; // Default 10 minutes if no end

      // Find messages in this phase
      const phaseMessages = replayMessages.filter((m) => {
        const msgTime = new Date(m.timestamp).getTime();
        return msgTime >= startTime && msgTime <= endTime;
      });

      const firstMessageIndex = replayMessages.findIndex(
        (m) => phaseMessages.length > 0 && m.id === phaseMessages[0].id
      );

      phases.push({
        id: transition.phase,
        name: PHASE_CONFIG[transition.phase]?.name || transition.phase,
        startTime: Math.floor((startTime - new Date(phaseTransitions[0].startedAt).getTime()) / 1000),
        endTime: Math.floor((endTime - new Date(phaseTransitions[0].startedAt).getTime()) / 1000),
        messageCount: phaseMessages.length,
        messageStartIndex: firstMessageIndex >= 0 ? firstMessageIndex : 0,
      });
    }
  } else {
    // Build from message timestamps using default phase timings
    const phaseIds = Object.keys(PHASE_CONFIG);
    let currentIndex = 0;

    for (const phaseId of phaseIds) {
      const config = PHASE_CONFIG[phaseId];
      const startTime = (45 - config.startMinute) * 60;
      const endTime = (45 - config.endMinute) * 60;

      // Find messages in this time range
      const phaseMessages = replayMessages.filter(
        (m) => m.elapsedTime >= startTime && m.elapsedTime < endTime
      );

      phases.push({
        id: phaseId,
        name: config.name,
        startTime,
        endTime: Math.min(endTime, totalDuration),
        messageCount: phaseMessages.length,
        messageStartIndex: currentIndex,
      });

      currentIndex += phaseMessages.length;
    }
  }

  return phases;
}

/**
 * Find key moments in the interview for navigation
 */
export function findKeyMoments(
  replayMessages: ReplayMessage[],
  originalMessages: Array<{ id: string; role: string; content: string; timestamp: Date }>
): KeyMoment[] {
  const keyMoments: KeyMoment[] = [];

  for (let i = 0; i < replayMessages.length; i++) {
    const message = replayMessages[i];
    const content = message.content.toLowerCase();

    // Detect phase transitions mentioned in interviewer messages
    if (message.role === "assistant") {
      if (
        content.includes("high-level design") ||
        content.includes("high level design") ||
        content.includes("let's design")
      ) {
        if (i > 0 && !keyMoments.some((km) => km.type === "phase_transition" && km.description.includes("High-Level"))) {
          keyMoments.push({
            description: "Transition to High-Level Design",
            messageIndex: i,
            timestamp: message.timestamp,
            type: "phase_transition",
          });
        }
      }

      if (content.includes("deep dive") || content.includes("let's dig deeper")) {
        if (!keyMoments.some((km) => km.type === "phase_transition" && km.description.includes("Deep Dive"))) {
          keyMoments.push({
            description: "Transition to Deep Dive",
            messageIndex: i,
            timestamp: message.timestamp,
            type: "phase_transition",
          });
        }
      }

      if (content.includes("scalability") || content.includes("scale")) {
        if (!keyMoments.some((km) => km.type === "phase_transition" && km.description.includes("Scalability"))) {
          keyMoments.push({
            description: "Transition to Scalability Discussion",
            messageIndex: i,
            timestamp: message.timestamp,
            type: "phase_transition",
          });
        }
      }

      // Detect positive feedback (good answers)
      if (
        content.includes("great") ||
        content.includes("excellent") ||
        content.includes("good point") ||
        content.includes("well thought")
      ) {
        keyMoments.push({
          description: "Positive feedback from interviewer",
          messageIndex: i,
          timestamp: message.timestamp,
          type: "good_answer",
        });
      }
    }
  }

  // Sort by message index
  keyMoments.sort((a, b) => a.messageIndex - b.messageIndex);

  return keyMoments;
}

/**
 * Format elapsed time for display
 */
export function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
