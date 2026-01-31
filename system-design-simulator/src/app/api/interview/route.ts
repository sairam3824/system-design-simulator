import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { complete } from "@/lib/llm";
import { getInterviewPrompt } from "@/lib/prompts/interviewer";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.CREATE, "api:interview:create", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { topic, difficulty = "medium" } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        userId: session.user.id,
        topic,
        difficulty,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    // Get initial interviewer message using LLM (Ollama with OpenAI fallback)
    const systemPrompt = getInterviewPrompt(topic, difficulty);

    const completion = await complete({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Start the interview." },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    const initialMessage = completion.content;

    if (!initialMessage) {
      throw new Error("Failed to generate initial message");
    }

    // Save system prompt and initial message
    await prisma.message.createMany({
      data: [
        {
          interviewId: interview.id,
          role: "system",
          content: systemPrompt,
        },
        {
          interviewId: interview.id,
          role: "assistant",
          content: initialMessage,
        },
      ],
    });

    return NextResponse.json({
      interview,
      initialMessage,
    });
  } catch (error) {
    console.error("Interview creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await rateLimit(request, RATE_LIMITS.READ, "api:interview:list", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const interviews = await prisma.interview.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { score: true },
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Interview fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
