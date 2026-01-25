import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CodingChallenge } from "@/components/coding/coding-challenge";

export default async function CodingChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const challenge = await prisma.codingChallenge.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      score: true,
    },
  });

  if (!challenge) {
    notFound();
  }

  // Calculate remaining time if in progress
  let remainingTime = null;
  if (challenge.status === "in_progress" && challenge.startedAt) {
    const elapsedMs = Date.now() - challenge.startedAt.getTime();
    const timeLimitMs = challenge.timeLimit * 60 * 1000;
    remainingTime = Math.max(0, timeLimitMs - elapsedMs);
  }

  return (
    <CodingChallenge
      initialChallenge={{
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        company: challenge.company,
        language: challenge.language,
        timeLimit: challenge.timeLimit,
        status: challenge.status,
        startedAt: challenge.startedAt?.toISOString() || null,
        starterCode: challenge.starterCode,
        finalCode: challenge.finalCode,
        visibleTests: JSON.parse(challenge.visibleTests),
        remainingTime,
        score: challenge.score
          ? {
              correctness: challenge.score.correctness,
              efficiency: challenge.score.efficiency,
              codeQuality: challenge.score.codeQuality,
              edgeCases: challenge.score.edgeCases,
              overallScore: challenge.score.overallScore,
              passStatus: challenge.score.passStatus,
              feedback: challenge.score.feedback,
              suggestedApproach: challenge.score.suggestedApproach,
              complexityAnalysis: challenge.score.complexityAnalysis,
            }
          : null,
      }}
    />
  );
}
