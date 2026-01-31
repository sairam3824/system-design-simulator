import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateCode,
  toEvaluationResult,
  quickSyntaxCheck,
  SupportedLanguage,
  TestCase,
} from "@/lib/coding";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/coding/challenge/[id]/submit - Submit code for evaluation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.SUBMIT, "api:coding:submit", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const challenge = await prisma.codingChallenge.findUnique({
      where: { id },
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

    // Check if challenge is still active
    if (challenge.status === "completed") {
      return NextResponse.json(
        { error: "Challenge already completed" },
        { status: 400 }
      );
    }

    // Check if time has expired
    if (challenge.startedAt) {
      const elapsedMs = Date.now() - challenge.startedAt.getTime();
      const timeLimitMs = challenge.timeLimit * 60 * 1000;
      if (elapsedMs > timeLimitMs) {
        return NextResponse.json(
          { error: "Time limit exceeded" },
          { status: 400 }
        );
      }
    }

    // Quick syntax check first
    const syntaxCheck = quickSyntaxCheck(
      code,
      challenge.language as SupportedLanguage
    );

    if (!syntaxCheck.valid) {
      // Create submission with syntax errors
      const submission = await prisma.challengeSubmission.create({
        data: {
          challengeId: id,
          code,
          language: challenge.language,
          isValid: false,
          errorMessage: syntaxCheck.errors.join("; "),
        },
      });

      return NextResponse.json({
        submission: {
          id: submission.id,
          isValid: false,
          errorMessage: submission.errorMessage,
          testResults: null,
        },
      });
    }

    // Parse test cases (only visible tests for intermediate evaluation)
    const visibleTests: TestCase[] = JSON.parse(challenge.visibleTests);

    // Evaluate code using AI
    let rawEvaluation;
    const isUnmodified = challenge.starterCode &&
      code.replace(/\s+/g, "") === challenge.starterCode.replace(/\s+/g, "");

    if (isUnmodified) {
      rawEvaluation = {
        testResults: visibleTests.map((tc, idx) => ({
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
        feedback: "You submitted the starter code without any changes. Please implement a solution.",
        suggestedApproach: undefined,
        complexityAnalysis: undefined,
      };
    } else {
      rawEvaluation = await evaluateCode({
        code,
        language: challenge.language as SupportedLanguage,
        problemDescription: challenge.description,
        testCases: visibleTests,
      });
    }

    const evaluation = toEvaluationResult(rawEvaluation, visibleTests);

    // Create submission record
    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId: id,
        code,
        language: challenge.language,
        evaluation: JSON.stringify(rawEvaluation),
        testResults: JSON.stringify(evaluation.testResults),
        isValid: evaluation.isValid,
        errorMessage: evaluation.errorMessage || null,
      },
    });

    // Update challenge with latest code
    await prisma.codingChallenge.update({
      where: { id },
      data: { finalCode: code },
    });

    return NextResponse.json({
      submission: {
        id: submission.id,
        isValid: evaluation.isValid,
        errorMessage: evaluation.errorMessage,
        testResults: evaluation.testResults.map((tr) => ({
          input: tr.testCase.input,
          expectedOutput: tr.testCase.expectedOutput,
          passed: tr.passed,
          actualOutput: tr.actualOutput,
          analysis: tr.analysis,
        })),
        syntaxErrors: evaluation.syntaxErrors,
        logicAnalysis: evaluation.logicAnalysis,
      },
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code. Please try again." },
      { status: 500 }
    );
  }
}
