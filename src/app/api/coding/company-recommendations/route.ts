import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ollamaChat, OllamaMessage } from "@/lib/ollama";

// POST /api/coding/company-recommendations - Get interview recommendations for a company
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyName } = body;

    if (!companyName || companyName.trim().length === 0) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert on technical interviews at various companies. Provide interview pattern recommendations for "${companyName}".

Return a JSON object with the following structure:
{
  "name": "${companyName}",
  "topTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "difficultyDistribution": {
    "easy": <number 0-3>,
    "medium": <number 0-3>,
    "hard": <number 0-3>
  },
  "description": "Brief description of their interview focus",
  "interviewStyle": "How they typically evaluate candidates"
}

IMPORTANT: The topTopics must ONLY contain values from this exact list:
- "arrays"
- "strings"
- "linked-lists"
- "stacks-queues"
- "trees"
- "graphs"
- "dynamic-programming"
- "recursion"
- "sorting-searching"
- "hash-tables"
- "heaps"
- "bit-manipulation"

Choose the 5 most relevant topics for ${companyName}'s typical coding interviews.
The difficulty distribution should reflect typical interview rounds (total should be 2-4 questions).

Respond with ONLY the JSON object, no additional text.`;

    const messages: OllamaMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await ollamaChat({
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.message.content;

    try {
      // Find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      const validTopics = [
        "arrays", "strings", "linked-lists", "stacks-queues", "trees",
        "graphs", "dynamic-programming", "recursion", "sorting-searching",
        "hash-tables", "heaps", "bit-manipulation"
      ];

      // Filter topics to only valid ones
      const filteredTopics = (parsed.topTopics || []).filter((topic: string) =>
        validTopics.includes(topic)
      );

      // Ensure we have at least some topics
      if (filteredTopics.length === 0) {
        filteredTopics.push("arrays", "strings", "hash-tables");
      }

      const recommendations = {
        name: parsed.name || companyName,
        topTopics: filteredTopics.slice(0, 5),
        difficultyDistribution: {
          easy: Math.min(3, Math.max(0, parsed.difficultyDistribution?.easy || 1)),
          medium: Math.min(3, Math.max(0, parsed.difficultyDistribution?.medium || 2)),
          hard: Math.min(3, Math.max(0, parsed.difficultyDistribution?.hard || 0)),
        },
        description: parsed.description || `Technical interview preparation for ${companyName}`,
        interviewStyle: parsed.interviewStyle || "Focus on problem-solving and code quality",
      };

      return NextResponse.json({ recommendations });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return default recommendations if parsing fails
      return NextResponse.json({
        recommendations: {
          name: companyName,
          topTopics: ["arrays", "strings", "hash-tables", "trees", "dynamic-programming"],
          difficultyDistribution: { easy: 1, medium: 2, hard: 0 },
          description: `Technical interview preparation for ${companyName}`,
          interviewStyle: "Focus on problem-solving, code quality, and algorithm optimization",
        },
      });
    }
  } catch (error) {
    console.error("Company recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations. Please try again." },
      { status: 500 }
    );
  }
}
