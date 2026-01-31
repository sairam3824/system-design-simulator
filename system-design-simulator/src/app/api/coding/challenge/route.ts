import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateCodingProblem,
  getStarterTemplate,
  TIME_LIMITS,
  DifficultyLevel,
  ProblemCategory,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  PROBLEM_CATEGORIES,
  DIFFICULTY_LEVELS,
} from "@/lib/coding";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/coding/challenge - Create a new coding challenge
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.CREATE, "api:coding:challenge:create", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const {
      difficulty,
      category,
      company,
      language,
      problemId, // Optional: use predefined problem
      generatedProblem, // Optional: use pre-generated problem from preview
    } = body;

    // Validate required fields
    if (!difficulty || !category || !language) {
      return NextResponse.json(
        { error: "Difficulty, category, and language are required" },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (!DIFFICULTY_LEVELS.includes(difficulty as DifficultyLevel)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    // Validate category
    if (!PROBLEM_CATEGORIES.includes(category as ProblemCategory)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate language
    if (!(language in SUPPORTED_LANGUAGES)) {
      return NextResponse.json(
        { error: "Invalid language" },
        { status: 400 }
      );
    }

    let problemData;
    let predefinedProblem = null;

    // Use pre-generated problem, predefined problem, or generate new one
    if (generatedProblem) {
      // Use the pre-generated problem from the preview API
      const fullDescription = formatFullDescription({
        title: generatedProblem.title,
        description: generatedProblem.description,
        constraints: generatedProblem.constraints || [],
        examples: generatedProblem.examples || [],
      });

      problemData = {
        title: generatedProblem.title,
        description: fullDescription,
        visibleTestCases: generatedProblem.visibleTestCases,
        hiddenTestCases: generatedProblem.hiddenTestCases,
        starterCode: generatedProblem.starterCode,
      };
    } else if (problemId) {
      predefinedProblem = await prisma.codingProblem.findUnique({
        where: { id: problemId },
      });

      if (!predefinedProblem) {
        return NextResponse.json(
          { error: "Problem not found" },
          { status: 404 }
        );
      }

      problemData = {
        title: predefinedProblem.title,
        description: predefinedProblem.description,
        visibleTestCases: JSON.parse(predefinedProblem.testCases).filter(
          (tc: { isHidden?: boolean }) => !tc.isHidden
        ),
        hiddenTestCases: JSON.parse(predefinedProblem.testCases).filter(
          (tc: { isHidden?: boolean }) => tc.isHidden
        ),
        starterCode: JSON.parse(predefinedProblem.starterCode)[language],
      };
    } else {
      // Generate new problem using Llama
      const newProblem = await generateCodingProblem({
        difficulty: difficulty as DifficultyLevel,
        category: category as ProblemCategory,
        company,
      });

      // Get starter code for the selected language
      const starterCode = getStarterTemplate(
        language as SupportedLanguage,
        newProblem.title,
        category as ProblemCategory
      );

      // Format full description with constraints and examples
      const fullDescription = formatFullDescription(newProblem);

      problemData = {
        title: newProblem.title,
        description: fullDescription,
        visibleTestCases: newProblem.visibleTestCases,
        hiddenTestCases: newProblem.hiddenTestCases,
        starterCode,
      };
    }

    // Create the challenge
    const challenge = await prisma.codingChallenge.create({
      data: {
        userId: session.user.id,
        problemId: predefinedProblem?.id || null,
        title: problemData.title,
        description: problemData.description,
        difficulty,
        category,
        company: company || null,
        language,
        visibleTests: JSON.stringify(problemData.visibleTestCases),
        hiddenTests: JSON.stringify(problemData.hiddenTestCases),
        timeLimit: TIME_LIMITS[difficulty as DifficultyLevel],
        status: "pending",
        starterCode: problemData.starterCode,
      },
    });

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
        starterCode: challenge.starterCode,
        visibleTests: JSON.parse(challenge.visibleTests),
      },
    });
  } catch (error) {
    console.error("Challenge creation error:", error);
    return NextResponse.json(
      { error: "Failed to create challenge. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/coding/challenge - List user's challenges
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:coding:challenge:list", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const challenges = await prisma.codingChallenge.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { score: true },
    });

    const formattedChallenges = challenges.map((c) => ({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      category: c.category,
      company: c.company,
      language: c.language,
      status: c.status,
      timeLimit: c.timeLimit,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      createdAt: c.createdAt,
      score: c.score
        ? {
            overallScore: c.score.overallScore,
            passStatus: c.score.passStatus,
          }
        : null,
    }));

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error("Challenge fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to format the full problem description
function formatFullDescription(problem: {
  title: string;
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
}): string {
  let description = `${problem.description}\n\n`;

  if (problem.constraints.length > 0) {
    description += `**Constraints:**\n`;
    problem.constraints.forEach((c) => {
      description += `- ${c}\n`;
    });
    description += "\n";
  }

  if (problem.examples.length > 0) {
    description += `**Examples:**\n\n`;
    problem.examples.forEach((ex, i) => {
      description += `**Example ${i + 1}:**\n`;
      description += `- Input: \`${ex.input}\`\n`;
      description += `- Output: \`${ex.output}\`\n`;
      if (ex.explanation) {
        description += `- Explanation: ${ex.explanation}\n`;
      }
      description += "\n";
    });
  }

  return description;
}
