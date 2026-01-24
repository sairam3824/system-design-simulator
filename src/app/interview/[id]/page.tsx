import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { InterviewChat } from "@/components/interview/interview-chat";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const interview = await prisma.interview.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
      },
      score: true,
    },
  });

  if (!interview) {
    notFound();
  }

  // Filter out system messages for display
  const displayMessages = interview.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));

  return (
    <InterviewChat
      interview={{
        id: interview.id,
        topic: interview.topic,
        difficulty: interview.difficulty,
        status: interview.status,
        startedAt: interview.startedAt?.toISOString() || null,
      }}
      initialMessages={displayMessages}
      score={
        interview.score
          ? {
              ...interview.score,
              feedback: JSON.parse(interview.score.feedback),
            }
          : null
      }
    />
  );
}
