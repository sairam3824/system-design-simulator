
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

// Helper function to format the full problem description
// Duplicated from challenge/route.ts - ideally should be in shared lib
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

// POST /api/coding/test - Create a new coding test with multiple challenges
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            problems, // Array of GeneratedProblem
            category,
            language,
            company,
        } = body;

        if (!problems || !Array.isArray(problems) || problems.length === 0) {
            return NextResponse.json(
                { error: "Problems list is required" },
                { status: 400 }
            );
        }

        // Calculate total time limit
        let totalTimeLimit = 0;
        const challengeDataList = [];

        // Process each problem to prepare for creation
        for (const problem of problems) {
            if (!problem.difficulty || !TIME_LIMITS[problem.difficulty as DifficultyLevel]) {
                continue; // Skip invalid problems
            }

            const diff = problem.difficulty as DifficultyLevel;
            totalTimeLimit += TIME_LIMITS[diff];

            const fullDescription = formatFullDescription({
                title: problem.title,
                description: problem.description,
                constraints: problem.constraints || [],
                examples: problem.examples || [],
            });

            // Ensure starter code exists
            let starterCode = problem.starterCode;
            if (!starterCode) {
                starterCode = getStarterTemplate(
                    language as SupportedLanguage,
                    problem.title,
                    category as ProblemCategory
                );
            }

            challengeDataList.push({
                userId: session.user.id,
                title: problem.title,
                description: fullDescription,
                difficulty: diff,
                category: category || "arrays",
                company: company || null,
                language: language || "python",
                visibleTests: JSON.stringify(problem.visibleTestCases || []),
                hiddenTests: JSON.stringify(problem.hiddenTestCases || []),
                timeLimit: TIME_LIMITS[diff],
                status: "pending",
                starterCode: starterCode,
            });
        }

        if (challengeDataList.length === 0) {
            return NextResponse.json(
                { error: "No valid problems to create test" },
                { status: 400 }
            );
        }

        // Create the CodingTest record
        const codingTest = await prisma.codingTest.create({
            data: {
                userId: session.user.id,
                status: "pending",
                timeLimit: totalTimeLimit,
                challenges: {
                    create: challengeDataList
                }
            },
            include: {
                challenges: true
            }
        });

        return NextResponse.json({
            test: {
                id: codingTest.id,
                status: codingTest.status,
                timeLimit: codingTest.timeLimit,
                challengeCount: codingTest.challenges.length
            }
        });
    } catch (error) {
        console.error("Test creation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create test. Please try again." },
            { status: 500 }
        );
    }
}
