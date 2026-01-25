import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ollamaChatStream, OllamaMessage } from "@/lib/ollama";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message, phaseContext, currentPhase } = body;

    if (!message && !phaseContext) {
      return new Response("Message or phaseContext is required", { status: 400 });
    }

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
      return new Response("Interview not found", { status: 404 });
    }

    if (interview.status === "completed") {
      return new Response("Interview is already completed", { status: 400 });
    }

    // Handle phase transition recording for time tracking
    if (phaseContext) {
      const currentTransitions: Array<{ phase: string; startedAt: string; endedAt?: string }> =
        interview.phaseTransitions ? JSON.parse(interview.phaseTransitions) : [];

      // Close previous phase if exists
      if (currentTransitions.length > 0) {
        const lastIndex = currentTransitions.length - 1;
        if (!currentTransitions[lastIndex].endedAt) {
          currentTransitions[lastIndex].endedAt = new Date().toISOString();
        }
      }

      // Start new phase
      currentTransitions.push({
        phase: phaseContext,
        startedAt: new Date().toISOString(),
      });

      await prisma.interview.update({
        where: { id },
        data: { phaseTransitions: JSON.stringify(currentTransitions) },
      });
    }

    // Save user message only if provided
    if (message) {
      await prisma.message.create({
        data: {
          interviewId: id,
          role: "user",
          content: message,
        },
      });
    }

    // Build conversation history for Ollama
    const messages: OllamaMessage[] = interview.messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    }));

    // Phase boundary enforcement reminder
    const phaseReminders: Record<string, string> = {
      requirements: "You are currently in the REQUIREMENTS CLARIFICATION phase (45:00-37:00). ONLY ask about: scale (DAU, QPS, data size), functional requirements, non-functional requirements (latency, consistency), and priorities. DO NOT ask about architecture, components, databases, or implementation yet.",
      "high-level": "You are currently in the HIGH-LEVEL DESIGN phase (37:00-25:00). ONLY ask about: overall architecture, main components, API design, data flow, and database choices at a high level. DO NOT dive into implementation details, algorithms, or schemas yet.",
      "deep-dive": "You are currently in the DEEP DIVE phase (25:00-13:00). NOW you can ask about: data models, schemas, algorithms, protocols, implementation details, and failure scenarios. DO NOT ask about scalability strategies yet.",
      scalability: "You are currently in the SCALABILITY phase (13:00-3:00). NOW you can ask about: scaling strategies (10x-100x), caching, sharding, load balancing, performance optimization, and trade-offs.",
      wrapup: "You are currently in the WRAP-UP phase (3:00-0:00). Summarize the design, address remaining concerns, and answer candidate questions.",
    };

    // Add context or user message
    if (phaseContext) {
      messages.push({
        role: "system",
        content: `TRANSITION: The interview timer has advanced to the "${phaseContext}" phase. 
        Please acknowledge this transition, briefly wrap up the previous topic if needed, and immediately start the ${phaseContext} phase by asking a relevant question. 
        Do not wait for the user to respond to the previous topic. Focus on the new phase requirements.`,
      });
    } else if (currentPhase && phaseReminders[currentPhase]) {
      // Add phase reminder for regular messages
      messages.push({
        role: "system",
        content: phaseReminders[currentPhase],
      });
    }

    if (message) {
      messages.push({ role: "user", content: message });
    }

    // Create streaming response using Ollama
    const ollamaStream = await ollamaChatStream({
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    const readable = new ReadableStream({
      async start(controller) {
        const reader = ollamaStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Save the complete assistant message only if it's NOT a phase transition
              // Phase transitions are handled by frontend state and shouldn't be duplicated in DB
              if (fullResponse.trim() && !phaseContext) {
                await prisma.message.create({
                  data: {
                    interviewId: id,
                    role: "assistant",
                    content: fullResponse,
                  },
                });
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
              break;
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete JSON lines from Ollama
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const json = JSON.parse(line);
                  if (json.message?.content) {
                    const content = json.message.content;
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);

          // Save partial response if any (but not for phase transitions)
          if (fullResponse.trim() && !phaseContext) {
            await prisma.message.create({
              data: {
                interviewId: id,
                role: "assistant",
                content: fullResponse,
              },
            });
          }

          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
