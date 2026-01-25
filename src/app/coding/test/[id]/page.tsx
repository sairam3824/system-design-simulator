
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CodingTest } from "@/components/coding/coding-test";

export default async function CodingTestPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const { id } = await params;

    const testSession = await prisma.codingTest.findFirst({
        where: {
            id,
            userId: session.user.id,
        },
        include: {
            challenges: {
                include: {
                    score: true
                },
                orderBy: {
                    createdAt: 'asc' // Assume creation order implies problem order
                }
            },
        },
    });

    if (!testSession) {
        notFound();
    }

    // Calculate remaining time
    let remainingTime = null;
    if (testSession.status === "in_progress" && testSession.startedAt) {
        const elapsedMs = Date.now() - testSession.startedAt.getTime();
        const timeLimitMs = testSession.timeLimit * 60 * 1000;
        remainingTime = Math.max(0, timeLimitMs - elapsedMs);
    } else if (testSession.status === "pending") {
        remainingTime = testSession.timeLimit * 60 * 1000;
    }

    // Map challenges to the format expected by CodingChallenge components
    const challenges = testSession.challenges.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        difficulty: c.difficulty,
        category: c.category,
        company: c.company,
        language: c.language,
        timeLimit: c.timeLimit,
        status: c.status,
        startedAt: c.startedAt?.toISOString() || null,
        starterCode: c.starterCode,
        finalCode: c.finalCode,
        visibleTests: JSON.parse(c.visibleTests),
        remainingTime: null, // Timer is managed globally by test
        score: c.score
            ? {
                correctness: c.score.correctness,
                efficiency: c.score.efficiency,
                codeQuality: c.score.codeQuality,
                edgeCases: c.score.edgeCases,
                overallScore: c.score.overallScore,
                passStatus: c.score.passStatus,
                feedback: c.score.feedback,
                suggestedApproach: c.score.suggestedApproach,
                complexityAnalysis: c.score.complexityAnalysis,
            }
            : null,
    }));

    return (
        <CodingTest
            testId={testSession.id}
            initialStatus={testSession.status}
            initialTimeRemaining={remainingTime}
            challenges={challenges}
        />
    );
}
