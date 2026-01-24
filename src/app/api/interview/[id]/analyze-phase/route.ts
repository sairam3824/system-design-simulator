import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { getPhaseAnalysisPrompt, INTERVIEW_PHASES } from "@/lib/prompts/interviewer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { phaseId, phaseMessages } = await request.json();

    // Validate phase
    const phase = INTERVIEW_PHASES.find((p) => p.id === phaseId);
    if (!phase) {
      return NextResponse.json({ error: "Invalid phase" }, { status: 400 });
    }

    // Verify interview belongs to user
    const interview = await prisma.interview.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Build conversation for analysis
    const userMessages = phaseMessages.filter((m: { role: string }) => m.role === "user");
    const substantiveUserMessages = userMessages.filter(
      (m: { content: string }) => m.content.trim().split(/\s+/).length > 10
    );

    const conversationText = phaseMessages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    // Add message stats to help AI evaluate accurately
    const messageStats = `
## Phase Message Statistics
- User messages in this phase: ${userMessages.length}
- Substantive user responses (>10 words): ${substantiveUserMessages.length}

**If the candidate provided 0 substantive responses in this phase, score MUST be 1.**
`;

    const analysisPrompt = getPhaseAnalysisPrompt(phaseId, phase.name);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: analysisPrompt },
        {
          role: "user",
          content: `${messageStats}\n\nAnalyze this ${phase.name} phase conversation:\n\n${conversationText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysisContent = response.choices[0].message.content;
    if (!analysisContent) {
      throw new Error("No analysis returned");
    }

    const analysis = JSON.parse(analysisContent);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Phase analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze phase" },
      { status: 500 }
    );
  }
}
