/**
 * Personalized Question Generator
 *
 * Uses OpenAI to generate interview questions tailored to user's profile,
 * skills, experience, and target companies.
 */

import { openai } from "./openai";
import {
  DifficultyLevel,
  UserProfileData,
  ResumeData,
  getDifficultyDescription,
} from "./difficulty-calculator";

export interface QuestionGeneratorInput {
  topic: string;
  difficulty: DifficultyLevel;
  profile: UserProfileData | null;
  resume: ResumeData | null;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  category: "requirements" | "high-level" | "deep-dive" | "scalability" | "trade-offs";
  difficulty: DifficultyLevel;
  focusAreas: string[];
  expectedTopics: string[];
  timeAllocation: number; // minutes
}

export interface PersonalizedQuestionSet {
  topic: string;
  difficulty: DifficultyLevel;
  totalDuration: number;
  questions: GeneratedQuestion[];
  focusAreas: string[];
  personalizationNotes: string;
  interviewerContext: string;
}

/**
 * Build context string from user profile
 */
function buildProfileContext(profile: UserProfileData | null): string {
  if (!profile) return "No profile data available.";

  const parts: string[] = [];

  if (profile.yearsExperience) {
    parts.push(`Years of experience: ${profile.yearsExperience}`);
  }

  if (profile.targetRole) {
    parts.push(`Target role: ${profile.targetRole}`);
  }

  if (profile.skills && profile.skills.length > 0) {
    parts.push(`Technical skills: ${profile.skills.join(", ")}`);
  }

  if (profile.targetCompanies && profile.targetCompanies.length > 0) {
    parts.push(`Target companies: ${profile.targetCompanies.join(", ")}`);
  }

  if (profile.bio) {
    parts.push(`Background: ${profile.bio}`);
  }

  return parts.length > 0 ? parts.join("\n") : "Limited profile data available.";
}

/**
 * Build context string from resume
 */
function buildResumeContext(resume: ResumeData | null): string {
  if (!resume) return "No resume data available.";

  const parts: string[] = [];

  if (resume.atsScore) {
    parts.push(`ATS Score: ${resume.atsScore}/100`);
  }

  if (resume.keywords && resume.keywords.length > 0) {
    parts.push(`Key technical keywords: ${resume.keywords.slice(0, 15).join(", ")}`);
  }

  if (resume.predictedRoles && resume.predictedRoles.length > 0) {
    parts.push(`Predicted suitable roles: ${resume.predictedRoles.join(", ")}`);
  }

  if (resume.analysis) {
    if (resume.analysis.experienceLevel) {
      parts.push(`Experience level: ${resume.analysis.experienceLevel}`);
    }
    if (resume.analysis.technicalDepth) {
      parts.push(`Technical depth: ${resume.analysis.technicalDepth}`);
    }
    if (resume.analysis.systemDesignExperience) {
      parts.push(`System design experience: ${resume.analysis.systemDesignExperience}`);
    }
  }

  return parts.length > 0 ? parts.join("\n") : "Limited resume data available.";
}

/**
 * Generate the question generation prompt
 */
function buildQuestionPrompt(input: QuestionGeneratorInput): string {
  const { topic, difficulty, profile, resume } = input;

  const profileContext = buildProfileContext(profile);
  const resumeContext = buildResumeContext(resume);
  const difficultyDesc = getDifficultyDescription(difficulty);

  return `You are an expert system design interview question generator for top tech companies (FAANG+).

Generate a personalized set of system design interview questions for the topic: "${topic}"

## Candidate Profile
${profileContext}

## Resume Analysis
${resumeContext}

## Interview Parameters
- Difficulty Level: ${difficulty.toUpperCase()}
- ${difficultyDesc}
- Total Interview Duration: 45 minutes

## Question Generation Guidelines

1. **Personalization**: Tailor questions to the candidate's skills and experience level.
   - If they have specific skills (e.g., Kafka, Redis), include questions that let them showcase these.
   - If they're targeting specific companies, align question style with those companies' interview patterns.

2. **Difficulty Calibration**:
   - EASY: Focus on fundamentals, basic patterns, straightforward requirements
   - MEDIUM: Include trade-off discussions, moderate scale, some edge cases
   - HARD: Complex scenarios, extreme scale, failure modes, advanced optimizations

3. **Coverage**: Questions should cover all phases:
   - Requirements Clarification (8 min): Scope, scale, constraints
   - High-Level Design (12 min): Architecture, components, data flow
   - Deep Dive (12 min): Specific component design, data models
   - Scalability (10 min): Growth, optimization, trade-offs
   - Trade-offs (3 min): Summary, alternatives considered

4. **Question Types to Include**:
   - Clarifying questions the interviewer should ask
   - Follow-up probes based on expected answers
   - Edge cases and failure scenarios
   - Scaling challenges specific to the system

## Output Format
Return a JSON object with the following structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "The main question text",
      "category": "requirements|high-level|deep-dive|scalability|trade-offs",
      "difficulty": "easy|medium|hard",
      "focusAreas": ["area1", "area2"],
      "expectedTopics": ["topic candidate should mention"],
      "timeAllocation": 5
    }
  ],
  "focusAreas": ["Overall focus areas based on candidate profile"],
  "personalizationNotes": "How questions were personalized for this candidate",
  "interviewerContext": "Context for the AI interviewer about this candidate's background"
}

Generate 8-12 questions covering all categories. Ensure the total time allocation sums to approximately 45 minutes.`;
}

/**
 * Parse OpenAI response into structured format
 */
function parseQuestionResponse(response: string): Partial<PersonalizedQuestionSet> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch (error) {
    console.error("Failed to parse question response:", error);
    return {
      questions: [],
      focusAreas: [],
      personalizationNotes: "Failed to generate personalized questions",
      interviewerContext: "",
    };
  }
}

/**
 * Generate personalized questions using OpenAI
 */
export async function generatePersonalizedQuestions(
  input: QuestionGeneratorInput
): Promise<PersonalizedQuestionSet> {
  const prompt = buildQuestionPrompt(input);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert system design interview question generator. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const parsed = parseQuestionResponse(responseText);

    return {
      topic: input.topic,
      difficulty: input.difficulty,
      totalDuration: 45,
      questions: parsed.questions || [],
      focusAreas: parsed.focusAreas || [],
      personalizationNotes: parsed.personalizationNotes || "",
      interviewerContext: parsed.interviewerContext || "",
    };
  } catch (error) {
    console.error("OpenAI question generation error:", error);

    // Return fallback questions
    return generateFallbackQuestions(input);
  }
}

/**
 * Generate fallback questions if OpenAI fails
 */
function generateFallbackQuestions(input: QuestionGeneratorInput): PersonalizedQuestionSet {
  const { topic, difficulty } = input;

  const baseQuestions: GeneratedQuestion[] = [
    {
      id: "q1",
      question: `Let's design ${topic}. Before we start, what clarifying questions would you like to ask about the requirements?`,
      category: "requirements",
      difficulty,
      focusAreas: ["scope", "constraints", "users"],
      expectedTopics: ["scale", "features", "non-functional requirements"],
      timeAllocation: 8,
    },
    {
      id: "q2",
      question: "Can you walk me through the high-level architecture? What are the main components?",
      category: "high-level",
      difficulty,
      focusAreas: ["architecture", "components"],
      expectedTopics: ["clients", "servers", "databases", "caches"],
      timeAllocation: 12,
    },
    {
      id: "q3",
      question: "Let's dive deeper into the data model. How would you structure the database?",
      category: "deep-dive",
      difficulty,
      focusAreas: ["data modeling", "storage"],
      expectedTopics: ["tables", "relationships", "indexes"],
      timeAllocation: 6,
    },
    {
      id: "q4",
      question: "How would you handle the core functionality? Walk me through the main flow.",
      category: "deep-dive",
      difficulty,
      focusAreas: ["implementation", "algorithms"],
      expectedTopics: ["API design", "business logic"],
      timeAllocation: 6,
    },
    {
      id: "q5",
      question: "How would you scale this system to handle 10x or 100x the current load?",
      category: "scalability",
      difficulty,
      focusAreas: ["scaling", "performance"],
      expectedTopics: ["horizontal scaling", "caching", "sharding"],
      timeAllocation: 5,
    },
    {
      id: "q6",
      question: "What are the potential bottlenecks and how would you address them?",
      category: "scalability",
      difficulty,
      focusAreas: ["bottlenecks", "optimization"],
      expectedTopics: ["database", "network", "compute"],
      timeAllocation: 5,
    },
    {
      id: "q7",
      question: "What trade-offs did you make in your design? Would you change anything?",
      category: "trade-offs",
      difficulty,
      focusAreas: ["trade-offs", "alternatives"],
      expectedTopics: ["consistency vs availability", "cost vs performance"],
      timeAllocation: 3,
    },
  ];

  return {
    topic,
    difficulty,
    totalDuration: 45,
    questions: baseQuestions,
    focusAreas: ["System Design Fundamentals", "Scalability", "Trade-offs"],
    personalizationNotes: "Using standard question set due to limited personalization data",
    interviewerContext: `Interviewing for ${topic} at ${difficulty} difficulty level.`,
  };
}

/**
 * Build enhanced interviewer prompt with personalization
 */
export function buildPersonalizedInterviewerPrompt(
  questionSet: PersonalizedQuestionSet,
  profile: UserProfileData | null
): string {
  const { topic, difficulty, interviewerContext, focusAreas, personalizationNotes } = questionSet;

  const skillsContext = profile?.skills?.length
    ? `The candidate has experience with: ${profile.skills.join(", ")}.`
    : "";

  const experienceContext = profile?.yearsExperience
    ? `They have ${profile.yearsExperience} years of experience.`
    : "";

  const companiesContext = profile?.targetCompanies?.length
    ? `They are targeting companies like: ${profile.targetCompanies.join(", ")}.`
    : "";

  return `You are a senior software engineer conducting a 45-minute system design interview at a top tech company.

## Interview Topic: ${topic}
## Difficulty: ${difficulty.toUpperCase()}

## Candidate Context
${interviewerContext}
${skillsContext}
${experienceContext}
${companiesContext}

## Personalization Notes
${personalizationNotes}

## Focus Areas for This Interview
${focusAreas.map(area => `- ${area}`).join("\n")}

## Interview Guidelines

1. **Adapt to the Candidate**: Use their background to ask relevant follow-up questions.
   - If they mention technologies they know, probe deeper on those.
   - If they're junior, provide more guidance; if senior, expect more depth.

2. **Difficulty Calibration**:
   ${difficulty === "easy" ? "- Be supportive and provide hints when the candidate is stuck" : ""}
   ${difficulty === "medium" ? "- Balance guidance with challenge, probe on trade-offs" : ""}
   ${difficulty === "hard" ? "- Be rigorous, expect precise answers, challenge all decisions" : ""}

3. **Phase Management**: Guide through all phases:
   - Requirements (8 min) → High-Level Design (12 min) → Deep Dive (12 min) → Scalability (10 min) → Wrap-up (3 min)

4. **Question Style**:
   - Keep responses concise (2-4 sentences)
   - Ask one question at a time
   - Acknowledge good points before probing deeper
   - Use "[PHASE_TRANSITION: phase-id]" to signal phase changes

5. **Personalized Probing**:
   - If candidate mentions their known technologies, ask how they'd apply them
   - For target company alignment, use similar question patterns those companies use

Start by introducing yourself briefly and asking the first clarifying question about requirements.`;
}
