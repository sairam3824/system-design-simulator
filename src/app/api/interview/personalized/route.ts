/**
 * Personalized Interview API
 *
 * Creates an interview with smart difficulty adjustment and personalized questions
 * based on user profile, skills, experience, and resume analysis.
 *
 * POST /api/interview/personalized
 * Body: { topic: string, selectedDifficulty: "easy" | "medium" | "hard" }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ollamaChat } from "@/lib/ollama";
import {
  calculateSmartDifficulty,
  DifficultyLevel,
  UserProfileData,
  ResumeData,
} from "@/lib/difficulty-calculator";
import {
  generatePersonalizedQuestions,
  buildPersonalizedInterviewerPrompt,
} from "@/lib/question-generator";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { topic, selectedDifficulty = "medium" } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties: DifficultyLevel[] = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(selectedDifficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    // 3. Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    // 4. Fetch latest resume
    const latestResume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    // 5. Parse profile data
    const profileData: UserProfileData | null = profile
      ? {
          yearsExperience: profile.yearsExperience,
          skills: profile.skills ? JSON.parse(profile.skills) : [],
          targetCompanies: profile.targetCompanies
            ? JSON.parse(profile.targetCompanies)
            : [],
          targetRole: profile.targetRole,
          bio: profile.bio,
        }
      : null;

    // 6. Parse resume data
    const resumeData: ResumeData | null = latestResume
      ? {
          content: latestResume.content,
          atsScore: latestResume.atsScore,
          keywords: latestResume.keywords
            ? JSON.parse(latestResume.keywords)
            : [],
          predictedRoles: latestResume.predictedRoles
            ? JSON.parse(latestResume.predictedRoles)
            : [],
          analysis: latestResume.analysis
            ? JSON.parse(latestResume.analysis)
            : null,
        }
      : null;

    // 7. Calculate smart difficulty
    const difficultyResult = calculateSmartDifficulty({
      selectedDifficulty,
      profile: profileData,
      resume: resumeData,
      topic,
    });

    const actualDifficulty = difficultyResult.calculatedDifficulty;

    // 8. Generate personalized questions
    const questionSet = await generatePersonalizedQuestions({
      topic,
      difficulty: actualDifficulty,
      profile: profileData,
      resume: resumeData,
    });

    // 9. Build personalized interviewer prompt
    const interviewerPrompt = buildPersonalizedInterviewerPrompt(
      questionSet,
      profileData
    );

    // 10. Create interview record
    const interview = await prisma.interview.create({
      data: {
        userId: session.user.id,
        topic,
        difficulty: actualDifficulty,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    // 11. Generate initial interviewer message using Ollama
    const initialCompletion = await ollamaChat({
      messages: [
        { role: "system", content: interviewerPrompt },
        { role: "user", content: "Start the interview." },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const initialMessage =
      initialCompletion.message?.content ||
      `Hey there! I'm Bobby, and I'll be your interviewer today. I'm excited to discuss ${topic} with you! Let's start with some clarifying questions - what's the first thing you'd want to understand about the requirements?`;

    // 12. Save messages to database
    await prisma.message.createMany({
      data: [
        {
          interviewId: interview.id,
          role: "system",
          content: interviewerPrompt,
        },
        {
          interviewId: interview.id,
          role: "assistant",
          content: initialMessage,
        },
      ],
    });

    // 13. Return response
    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        topic: interview.topic,
        difficulty: interview.difficulty,
        status: interview.status,
        startedAt: interview.startedAt,
      },
      initialMessage,
      personalization: {
        selectedDifficulty,
        calculatedDifficulty: actualDifficulty,
        wasAdjusted: selectedDifficulty !== actualDifficulty,
        adjustmentReason: difficultyResult.adjustmentReason,
        confidenceScore: difficultyResult.confidenceScore,
        breakdown: difficultyResult.breakdown,
        recommendations: difficultyResult.recommendations,
      },
      questionSet: {
        focusAreas: questionSet.focusAreas,
        personalizationNotes: questionSet.personalizationNotes,
        questionCount: questionSet.questions.length,
      },
    });
  } catch (error) {
    console.error("Personalized interview creation error:", error);
    return NextResponse.json(
      { error: "Failed to create personalized interview" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview difficulty calculation without creating interview
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const selectedDifficulty =
      (searchParams.get("difficulty") as DifficultyLevel) || "medium";
    const topic = searchParams.get("topic") || "System Design";

    // Fetch user data
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const latestResume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    // Parse data
    const profileData: UserProfileData | null = profile
      ? {
          yearsExperience: profile.yearsExperience,
          skills: profile.skills ? JSON.parse(profile.skills) : [],
          targetCompanies: profile.targetCompanies
            ? JSON.parse(profile.targetCompanies)
            : [],
          targetRole: profile.targetRole,
          bio: profile.bio,
        }
      : null;

    const resumeData: ResumeData | null = latestResume
      ? {
          content: latestResume.content,
          atsScore: latestResume.atsScore,
          keywords: latestResume.keywords
            ? JSON.parse(latestResume.keywords)
            : [],
          predictedRoles: latestResume.predictedRoles
            ? JSON.parse(latestResume.predictedRoles)
            : [],
          analysis: latestResume.analysis
            ? JSON.parse(latestResume.analysis)
            : null,
        }
      : null;

    // Calculate difficulty
    const difficultyResult = calculateSmartDifficulty({
      selectedDifficulty,
      profile: profileData,
      resume: resumeData,
      topic,
    });

    return NextResponse.json({
      selectedDifficulty,
      calculatedDifficulty: difficultyResult.calculatedDifficulty,
      wasAdjusted: selectedDifficulty !== difficultyResult.calculatedDifficulty,
      adjustmentReason: difficultyResult.adjustmentReason,
      confidenceScore: difficultyResult.confidenceScore,
      breakdown: difficultyResult.breakdown,
      recommendations: difficultyResult.recommendations,
      profileSummary: {
        hasProfile: !!profile,
        hasResume: !!latestResume,
        yearsExperience: profileData?.yearsExperience || null,
        skillsCount: profileData?.skills?.length || 0,
        targetCompaniesCount: profileData?.targetCompanies?.length || 0,
      },
    });
  } catch (error) {
    console.error("Difficulty preview error:", error);
    return NextResponse.json(
      { error: "Failed to calculate difficulty" },
      { status: 500 }
    );
  }
}
