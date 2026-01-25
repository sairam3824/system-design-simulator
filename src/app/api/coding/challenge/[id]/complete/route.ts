import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateCode,
  calculateScore,
  SupportedLanguage,
  TestCase,
} from "@/lib/coding";

// POST /api/coding/challenge/[id]/complete - Complete challenge and get final score
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { code } = body;

    const challenge = await prisma.codingChallenge.findUnique({
      where: { id },
      include: { score: true },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already completed, return existing score
    if (challenge.status === "completed" && challenge.score) {
      return NextResponse.json({
        score: {
          correctness: challenge.score.correctness,
          efficiency: challenge.score.efficiency,
          codeQuality: challenge.score.codeQuality,
          edgeCases: challenge.score.edgeCases,
          overallScore: challenge.score.overallScore,
          passStatus: challenge.score.passStatus,
          feedback: challenge.score.feedback,
          suggestedApproach: challenge.score.suggestedApproach,
          complexityAnalysis: challenge.score.complexityAnalysis,
        },
      });
    }

    // Use provided code or final code from challenge
    const finalCode = code || challenge.finalCode || challenge.starterCode || "";

    if (!finalCode.trim()) {
      return NextResponse.json(
        { error: "No code to evaluate" },
        { status: 400 }
      );
    }

    // Parse all test cases (visible + hidden)
    const visibleTests: TestCase[] = JSON.parse(challenge.visibleTests);
    const hiddenTests: TestCase[] = JSON.parse(challenge.hiddenTests);
    const allTests = [...visibleTests, ...hiddenTests];

    let rawEvaluation;

    // Check if code is unmodified starter code (ignoring whitespace)
    const isUnmodified = challenge.starterCode &&
      finalCode.replace(/\s+/g, "") === challenge.starterCode.replace(/\s+/g, "");

    if (isUnmodified) {
      rawEvaluation = {
        testResults: allTests.map((tc, idx) => ({
          testIndex: idx,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          predictedOutput: "No output",
          passed: false,
          analysis: "Code was not modified"
        })),
        syntaxValid: true,
        syntaxErrors: [],
        logicAnalysis: "The code appears to be the unmodified starter template.",
        correctness: 0,
        efficiency: 0,
        codeQuality: 0,
        edgeCases: 0,
        feedback: "You submitted the starter code without any changes. Please implement a solution to solve the problem.",
        suggestedApproach: "Start by analyzing the input constraints and expected output.",
        complexityAnalysis: undefined,
      };
    } else {
      // Full evaluation with all test cases
      rawEvaluation = await evaluateCode({
        code: finalCode,
        language: challenge.language as SupportedLanguage,
        problemDescription: challenge.description,
        testCases: allTests,
      });
    }

    // Calculate final score
    const scoreResult = calculateScore(rawEvaluation);

    // Create final submission
    await prisma.challengeSubmission.create({
      data: {
        challengeId: id,
        code: finalCode,
        language: challenge.language,
        evaluation: JSON.stringify(rawEvaluation),
        testResults: JSON.stringify(rawEvaluation.testResults),
        isValid: rawEvaluation.syntaxValid,
        errorMessage: rawEvaluation.syntaxErrors.length > 0
          ? rawEvaluation.syntaxErrors.join("; ")
          : null,
      },
    });

    // Save score
    const savedScore = await prisma.challengeScore.create({
      data: {
        challengeId: id,
        correctness: scoreResult.correctness,
        efficiency: scoreResult.efficiency,
        codeQuality: scoreResult.codeQuality,
        edgeCases: scoreResult.edgeCases,
        overallScore: scoreResult.overallScore,
        passStatus: scoreResult.passStatus,
        feedback: scoreResult.feedback,
        suggestedApproach: scoreResult.suggestedApproach || null,
        complexityAnalysis: scoreResult.complexityAnalysis || null,
      },
    });

    // Mark challenge as completed
    await prisma.codingChallenge.update({
      where: { id },
      data: {
        status: "completed",
        endedAt: new Date(),
        finalCode,
      },
    });

    return NextResponse.json({
      score: {
        correctness: savedScore.correctness,
        efficiency: savedScore.efficiency,
        codeQuality: savedScore.codeQuality,
        edgeCases: savedScore.edgeCases,
        overallScore: savedScore.overallScore,
        passStatus: savedScore.passStatus,
        feedback: savedScore.feedback,
        suggestedApproach: savedScore.suggestedApproach,
        complexityAnalysis: savedScore.complexityAnalysis,
      },
      testResults: {
        visible: rawEvaluation.testResults.filter((_, i) => i < visibleTests.length),
        hidden: rawEvaluation.testResults.filter((_, i) => i >= visibleTests.length),
        total: rawEvaluation.testResults.length,
        passed: rawEvaluation.testResults.filter((r) => r.passed).length,
      },
    });
  } catch (error) {
    console.error("Challenge completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete challenge. Please try again." },
      { status: 500 }
    );
  }
}
