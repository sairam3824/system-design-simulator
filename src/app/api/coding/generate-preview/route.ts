import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateCodingProblem,
  generateHiddenTestCases,
  getStarterTemplate,
  DifficultyLevel,
  ProblemCategory,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  PROBLEM_CATEGORIES,
  DIFFICULTY_LEVELS,
  COMPANY_PATTERNS,
  Company,
} from "@/lib/coding";

interface QuestionCounts {
  easy: number;
  medium: number;
  hard: number;
}

// POST /api/coding/generate-preview - Generate preview of coding problems
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      category,
      company,
      language,
      questionCounts,
      mode,
    } = body;

    // Validate required fields
    if (!category || !language || !questionCounts) {
      return NextResponse.json(
        { error: "Category, language, and question counts are required" },
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

    const counts = questionCounts as QuestionCounts;
    const totalQuestions = counts.easy + counts.medium + counts.hard;

    if (totalQuestions === 0) {
      return NextResponse.json(
        { error: "Please select at least one question" },
        { status: 400 }
      );
    }

    // Generate problems for each difficulty level
    const problems: Array<{
      difficulty: DifficultyLevel;
      title: string;
      description: string;
      constraints: string[];
      examples: { input: string; output: string; explanation?: string }[];
      visibleTestCases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
      hiddenTestCases: Array<{ input: string; expectedOutput: string; explanation?: string; isHidden?: boolean }>;
      starterCode: string;
      solutionApproaches: string[];
      expectedComplexity: { time: string; space: string };
    }> = [];

    const difficultyOrder: DifficultyLevel[] = ["easy", "medium", "hard"];

    for (const difficulty of difficultyOrder) {
      const count = counts[difficulty];

      for (let i = 0; i < count; i++) {
        try {
          // Determine actual category for this problem
          let problemCategory = category as ProblemCategory;

          if (category === "mixed") {
            if (company && company in COMPANY_PATTERNS) {
              const pattern = COMPANY_PATTERNS[company as Company];
              if (pattern.topTopics.length > 0) {
                // Pick a random topic from the company's top topics to ensure variety
                // We use randomness to ensure different questions get different topics
                const randomIndex = Math.floor(Math.random() * pattern.topTopics.length);
                problemCategory = pattern.topTopics[randomIndex];
              } else {
                problemCategory = "arrays"; // Fallback
              }
            } else {
              // Random from all categories (excluding "mixed")
              const validCategories = PROBLEM_CATEGORIES.filter(c => c !== "mixed");
              const randomIndex = Math.floor(Math.random() * validCategories.length);
              problemCategory = validCategories[randomIndex];
            }
          }

          // Generate the problem using Llama
          const generatedProblem = await generateCodingProblem({
            difficulty,
            category: problemCategory,
            company: company || undefined,
            model: mode === "coding-interview" ? "codellama" : "llama3",
          });

          // Generate additional hidden test cases if needed
          let hiddenTestCases = generatedProblem.hiddenTestCases;
          if (hiddenTestCases.length < 3) {
            const additionalTests = await generateHiddenTestCases(
              generatedProblem.description,
              [...generatedProblem.visibleTestCases, ...hiddenTestCases],
              5 - hiddenTestCases.length
            );
            hiddenTestCases = [...hiddenTestCases, ...additionalTests];
          }

          // Get starter code for the selected language
          const starterCode = getStarterTemplate(
            language as SupportedLanguage,
            generatedProblem.title,
            problemCategory, // Use the resolved category
          );

          problems.push({
            difficulty,
            title: generatedProblem.title,
            description: generatedProblem.description,
            constraints: generatedProblem.constraints,
            examples: generatedProblem.examples,
            visibleTestCases: generatedProblem.visibleTestCases,
            hiddenTestCases,
            starterCode,
            solutionApproaches: generatedProblem.solutionApproaches,
            expectedComplexity: generatedProblem.expectedComplexity,
          });
        } catch (error) {
          console.error(`Failed to generate ${difficulty} problem ${i + 1}:`, error);
          // Continue generating other problems even if one fails
        }
      }
    }

    if (problems.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any problems. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      problems,
      totalGenerated: problems.length,
      requested: totalQuestions,
    });
  } catch (error) {
    console.error("Problem generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate problems. Please try again." },
      { status: 500 }
    );
  }
}
