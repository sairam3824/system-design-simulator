import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

const ANALYSIS_PROMPT = `You are a technical recruiter and career coach specializing in FAANG/Big Tech interviews.

Analyze the following resume and provide a JSON response with:
1. "skills": Array of technical skills identified (max 10 most relevant)
2. "experience": A brief summary of their experience level (e.g., "5 years as a backend engineer")
3. "strengths": Array of 3-5 key strengths based on the resume
4. "suggestedTopics": Array of 3-5 system design interview topics that would be appropriate based on their background (e.g., "Design Twitter", "Design Uber", "Design Netflix")
5. "summary": A 2-3 sentence professional summary

Focus on system design interview relevance. Return ONLY valid JSON, no markdown.

Resume:
`;

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

    // Verify ownership and get resume
    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Analyze with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a technical recruiter analyzing resumes. Return only valid JSON.",
        },
        {
          role: "user",
          content: ANALYSIS_PROMPT + resume.content,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis returned from OpenAI");
    }

    const analysis = JSON.parse(analysisText);

    // Update resume with analysis
    await prisma.resume.update({
      where: { id },
      data: {
        analysis: JSON.stringify(analysis),
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
