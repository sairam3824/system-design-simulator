import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { SCORING_PROMPT } from "@/lib/prompts/interviewer";

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

    // Verify ownership and get interview with messages
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status === "completed") {
      return NextResponse.json({ error: "Interview already completed" }, { status: 400 });
    }

    // Build conversation for scoring
    const userMessages = interview.messages.filter((m) => m.role === "user");
    const assistantMessages = interview.messages.filter((m) => m.role === "assistant");

    // Count substantive user messages (more than just short acknowledgments)
    const substantiveUserMessages = userMessages.filter(
      (m) => m.content.trim().split(/\s+/).length > 10 // More than 10 words
    );

    const conversationText = interview.messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    // Add metadata about message counts to help AI evaluate accurately
    const messageStats = `
## Interview Statistics
- Total user messages: ${userMessages.length}
- Substantive user responses (>10 words): ${substantiveUserMessages.length}
- Total interviewer questions: ${assistantMessages.length}

**IMPORTANT: If substantive user responses is 0 or very low, the candidate did not meaningfully participate. Score ALL dimensions as 1.**
`;

    // Get AI scoring
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SCORING_PROMPT },
        {
          role: "user",
          content: `Interview Topic: ${interview.topic}\n${messageStats}\n\nConversation:\n${conversationText}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const scoreText = completion.choices[0]?.message?.content;

    if (!scoreText) {
      throw new Error("Failed to generate score");
    }

    const scoreData = JSON.parse(scoreText);

    // Calculate weighted overall score
    const weights = {
      requirementsClarification: 0.10,
      highLevelDesign: 0.20,
      detailedDesign: 0.15,
      scalability: 0.20,
      tradeoffs: 0.25,
      communication: 0.10,
    };

    const overallScore =
      scoreData.requirementsClarification * weights.requirementsClarification +
      scoreData.highLevelDesign * weights.highLevelDesign +
      scoreData.detailedDesign * weights.detailedDesign +
      scoreData.scalability * weights.scalability +
      scoreData.tradeoffs * weights.tradeoffs +
      scoreData.communication * weights.communication;

    // Determine pass status
    const allDimensions = [
      scoreData.requirementsClarification,
      scoreData.highLevelDesign,
      scoreData.detailedDesign,
      scoreData.scalability,
      scoreData.tradeoffs,
      scoreData.communication,
    ];

    const passStatus =
      overallScore >= 2.5 &&
      allDimensions.every((d: number) => d >= 2) &&
      scoreData.tradeoffs >= 3;

    // Create score record
    const score = await prisma.score.create({
      data: {
        interviewId: id,
        requirementsClarification: scoreData.requirementsClarification,
        highLevelDesign: scoreData.highLevelDesign,
        detailedDesign: scoreData.detailedDesign,
        scalability: scoreData.scalability,
        tradeoffs: scoreData.tradeoffs,
        communication: scoreData.communication,
        overallScore,
        passStatus,
        feedback: JSON.stringify(scoreData.feedback),
      },
    });

    // Update interview status
    await prisma.interview.update({
      where: { id },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    });

    return NextResponse.json({
      score: {
        ...score,
        feedback: scoreData.feedback,
      },
    });
  } catch (error) {
    console.error("End interview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
